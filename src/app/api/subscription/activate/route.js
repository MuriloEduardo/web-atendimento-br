import { NextResponse } from 'next/server';
import db from '@/lib/mockDb';
import { PLANS } from '@/lib/plans';

const isStripeConfigured = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  return Boolean(secretKey && !secretKey.startsWith('sk_test_sua_chave'));
};

const getStripeInstance = async () => {
  if (!isStripeConfigured()) {
    throw new Error('Stripe não configurado');
  }

  const Stripe = (await import('stripe')).default;
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15'
  });
};

export async function POST(request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: 'Stripe não configurado.' }, { status: 400 });
    }

    const authHeader = request.headers.get('authorization');
    const user = db.getUserFromToken(authHeader);

    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { paymentIntentId } = await request.json();

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'paymentIntentId é obrigatório' }, { status: 400 });
    }

    const stripe = await getStripeInstance();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return NextResponse.json({ error: 'Pagamento não encontrado na Stripe' }, { status: 404 });
    }

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Pagamento ainda não aprovado' }, { status: 409 });
    }

    if (paymentIntent.amount_received <= 0) {
      return NextResponse.json({ error: 'Pagamento sem valor recebido' }, { status: 409 });
    }

    const metadata = paymentIntent.metadata || {};
    const metadataUserId = metadata.userId ? parseInt(metadata.userId, 10) : null;

    if (metadataUserId && metadataUserId !== user.id) {
      return NextResponse.json({ error: 'Pagamento não pertence ao usuário autenticado' }, { status: 403 });
    }

    const planId = metadata.planId || user.planId;
    const plan = planId ? PLANS[planId] : null;

    if (!plan) {
      return NextResponse.json({ error: 'Plano associado ao pagamento não encontrado' }, { status: 400 });
    }

    const nowIso = new Date().toISOString();
    let subscription = db.getSubscriptionByUserId(user.id);

    if (!subscription) {
      subscription = db.createSubscription({
        userId: user.id,
        planId: plan.id,
        planName: plan.name,
        price: plan.price,
        currency: plan.currency,
        status: 'active',
        activatedAt: nowIso,
        currentPeriodStart: nowIso,
        currentPeriodEnd: null,
        features: plan.features,
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: paymentIntent.customer || user.stripeCustomerId || null
      });
    } else {
      db.updateSubscription(subscription.id, {
        planId: plan.id,
        planName: plan.name,
        price: plan.price,
        currency: plan.currency,
        features: plan.features,
        status: 'active',
        activatedAt: nowIso,
        currentPeriodStart: subscription.currentPeriodStart || nowIso,
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: paymentIntent.customer || subscription.stripeCustomerId || null
      });

      subscription = db.getSubscriptionById(subscription.id);
    }

    db.updateUser(user.id, {
      planId: plan.id,
      subscriptionStatus: 'active',
      subscriptionId: subscription.id,
      subscriptionActive: true,
      stripeCustomerId: subscription.stripeCustomerId || paymentIntent.customer || user.stripeCustomerId || null
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        planId: subscription.planId,
        planName: subscription.planName,
        price: subscription.price,
        currency: subscription.currency,
        features: subscription.features
      }
    });

  } catch (error) {
    console.error('Erro ao ativar assinatura:', error);
    const status = error.statusCode || 500;
    return NextResponse.json({ error: error.message || 'Erro interno do servidor' }, { status });
  }
}
