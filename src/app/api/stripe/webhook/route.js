import { NextResponse } from 'next/server';
import db from '@/lib/mockDb';

// Verificar se Stripe está configurado
const isStripeConfigured = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  return secretKey && !secretKey.startsWith('sk_test_sua_chave');
};

// Inicializar Stripe dinamicamente apenas quando configurado
const getStripeInstance = async () => {
  if (!isStripeConfigured()) {
    throw new Error('Stripe não configurado');
  }
  
  const Stripe = (await import('stripe')).default;
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
  });
};

export async function POST(request) {
  // Verificar se Stripe está configurado
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe não configurado. Use o modo mock.' }, { status: 400 });
  }

  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;

  try {
    const stripe = await getStripeInstance();
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Erro na verificação do webhook:', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Evento não tratado: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session) {
  const userId = parseInt(session.metadata.userId);
  const planId = session.metadata.planId;
  const isTrial = session.metadata.trial === 'true';

  console.log('Checkout completado:', { userId, planId, isTrial });

  // Se for trial, criar assinatura em trial
  if (isTrial) {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);

    const subscription = db.createSubscription({
      userId: userId,
      planId: planId,
      stripeSubscriptionId: session.subscription,
      stripeCustomerId: session.customer,
      status: 'trialing',
      trialStart: new Date().toISOString(),
      trialEnd: trialEnd.toISOString(),
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: trialEnd.toISOString()
    });

    // Atualizar usuário
    db.updateUser(userId, {
      subscriptionId: subscription.id,
      subscriptionStatus: 'trialing',
      planId: planId,
      stripeCustomerId: session.customer
    });
  }
}

async function handleSubscriptionCreated(subscription) {
  const metadataUserId = subscription.metadata?.userId ? parseInt(subscription.metadata.userId, 10) : null;

  console.log('Assinatura criada:', { metadataUserId, subscriptionId: subscription.id });

  let localSubscription = db.getSubscriptionByStripeId(subscription.id);

  if (!localSubscription && metadataUserId) {
    localSubscription = db.getSubscriptionByUserId(metadataUserId);
  }

  if (localSubscription) {
    db.updateSubscription(localSubscription.id, {
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
    });
  }

  const userId = localSubscription?.userId || metadataUserId;

  if (userId) {
    db.updateUser(userId, {
      subscriptionStatus: subscription.status,
      subscriptionActive: subscription.status === 'active'
    });
  }
}

async function handleSubscriptionUpdated(subscription) {
  const metadataUserId = subscription.metadata?.userId ? parseInt(subscription.metadata.userId, 10) : null;

  console.log('Assinatura atualizada:', { metadataUserId, status: subscription.status });

  let localSubscription = db.getSubscriptionByStripeId(subscription.id);

  if (!localSubscription && metadataUserId) {
    localSubscription = db.getSubscriptionByUserId(metadataUserId);
  }

  if (localSubscription) {
    db.updateSubscription(localSubscription.id, {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
    });
  }

  const userId = localSubscription?.userId || metadataUserId;

  if (userId) {
    db.updateUser(userId, {
      subscriptionStatus: subscription.status,
      subscriptionActive: subscription.status === 'active'
    });
  }
}

async function handleSubscriptionDeleted(subscription) {
  const metadataUserId = subscription.metadata?.userId ? parseInt(subscription.metadata.userId, 10) : null;

  console.log('Assinatura cancelada:', { metadataUserId });

  let localSubscription = db.getSubscriptionByStripeId(subscription.id);

  if (!localSubscription && metadataUserId) {
    localSubscription = db.getSubscriptionByUserId(metadataUserId);
  }

  if (localSubscription) {
    db.updateSubscription(localSubscription.id, {
      status: 'canceled',
      canceledAt: new Date().toISOString()
    });

    const userId = localSubscription.userId;
    db.updateUser(userId, {
      subscriptionStatus: 'canceled',
      subscriptionActive: false
    });
  }
}

async function handlePaymentSucceeded(invoice) {
  console.log('Pagamento realizado com sucesso:', { 
    customerId: invoice.customer,
    amount: invoice.amount_paid / 100 
  });
  
  const subscriptionId = invoice.subscription;
  const localSubscription = db.getSubscriptionByStripeId(subscriptionId);
  const userFromSubscription = localSubscription ? db.getUserById(localSubscription.userId) : null;
  const userFromCustomer = db.getUserByStripeCustomerId(invoice.customer);
  const targetUser = userFromSubscription || userFromCustomer;

  if (localSubscription) {
    const period = invoice.lines?.data?.[0]?.period;
    db.updateSubscription(localSubscription.id, {
      status: 'active',
      lastPaymentAt: new Date().toISOString(),
      currentPeriodEnd: period?.end ? new Date(period.end * 1000).toISOString() : localSubscription.currentPeriodEnd,
      currentPeriodStart: period?.start ? new Date(period.start * 1000).toISOString() : localSubscription.currentPeriodStart
    });
  }

  if (targetUser) {
    db.updateUser(targetUser.id, {
      subscriptionStatus: 'active',
      subscriptionActive: true
    });
  }
}

async function handlePaymentFailed(invoice) {
  console.log('Falha no pagamento:', { 
    customerId: invoice.customer,
    amount: invoice.amount_due / 100 
  });
  
  const subscriptionId = invoice.subscription;
  const localSubscription = db.getSubscriptionByStripeId(subscriptionId);
  const userFromSubscription = localSubscription ? db.getUserById(localSubscription.userId) : null;
  const userFromCustomer = db.getUserByStripeCustomerId(invoice.customer);
  const targetUser = userFromSubscription || userFromCustomer;

  if (localSubscription) {
    db.updateSubscription(localSubscription.id, {
      status: 'past_due',
      lastPaymentAttemptAt: new Date().toISOString()
    });
  }

  if (targetUser) {
    db.updateUser(targetUser.id, {
      subscriptionStatus: 'past_due',
      subscriptionActive: false
    });
  }
}