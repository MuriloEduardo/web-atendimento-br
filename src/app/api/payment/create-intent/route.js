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

    // Se Stripe não está configurado, retornar modo mock
    if (!isStripeConfigured()) {
      console.log('[Payment] Modo mock - Stripe não configurado');
      return NextResponse.json({
        clientSecret: `pi_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        planName: plan.name,
        amount: plan.price,
        currency: plan.currency,
        trial: trial,
        mode: 'mock',
        message: 'Modo de teste - Stripe não configurado'
      });
    }

    // Obter instância do Stripe
    const stripe = await getStripeInstance();

    // Criar PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: plan.price,
      currency: plan.currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: user.id,
        planId: planId,
        trial: trial.toString(),
        userName: user.name,
      },
      setup_future_usage: trial ? 'off_session' : undefined, // Para trials, configurar para uso futuro
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      planName: plan.name,
      amount: plan.price,
      currency: plan.currency,
      trial: trial,
      mode: 'production'
    });

  } catch (error) {
    console.error('Erro ao criar Payment Intent:', error);
    const status = error.statusCode || 500;
    const message = error?.message || 'Erro interno do servidor';
    return NextResponse.json({ error: message }, { status });
  }
}