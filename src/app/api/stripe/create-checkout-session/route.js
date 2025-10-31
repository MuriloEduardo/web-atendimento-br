import { NextResponse } from 'next/server';
import db from '@/lib/mockDb';
import { PLANS } from '@/lib/plans';

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
  try {
    // Verificar se Stripe está configurado
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: 'Stripe não configurado. Use o modo mock.' }, { status: 400 });
    }

    // Verificar token de autenticação
    const authHeader = request.headers.get('authorization');
    const user = db.getUserFromToken(authHeader);
    
    if (!user) {
      return NextResponse.json({ error: 'Token inválido ou não fornecido' }, { status: 401 });
    }

    const { planId, trial = false } = await request.json();

    // Verificar se o plano existe
    if (!PLANS[planId]) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }

    const plan = PLANS[planId];

    // Obter instância do Stripe
    const stripe = await getStripeInstance();

    // Criar sessão de checkout do Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: plan.currency,
            product_data: {
              name: `Plano ${plan.name} - Atendimento BR`,
              description: `Automação WhatsApp - Plano ${plan.name}`,
              images: ['https://your-domain.com/logo.png'], // Substitua pela URL do seu logo
            },
            unit_amount: plan.price,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      
      // Configurar trial se solicitado
      subscription_data: trial ? {
        trial_period_days: 7,
        metadata: {
          userId: user.id.toString(),
          planId: planId,
        },
      } : {
        metadata: {
          userId: user.id.toString(),
          planId: planId,
        },
      },

      // URLs de redirecionamento
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`,

      // Metadados para webhook
      metadata: {
        userId: user.id.toString(),
        planId: planId,
        trial: trial.toString(),
      },

      // Permitir códigos promocionais
      allow_promotion_codes: true,

      // Configurações de aparência
      locale: 'pt-BR',
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    return NextResponse.json({ 
      error: 'Erro ao criar sessão de pagamento',
      details: error.message 
    }, { status: 500 });
  }
}

// Função auxiliar para verificar sessão de checkout
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID não fornecido' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      status: session.payment_status,
      customerEmail: session.customer_email,
      metadata: session.metadata
    });

  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return NextResponse.json({ error: 'Erro ao verificar sessão' }, { status: 500 });
  }
}