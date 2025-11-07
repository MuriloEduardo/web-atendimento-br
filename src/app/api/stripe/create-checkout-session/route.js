import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { PLANS } from '@/lib/plans';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-dev-only';

// Verificar se Stripe está configurado
const isStripeConfigured = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  return secretKey && secretKey.startsWith('sk_test_') || secretKey?.startsWith('sk_live_');
};

// Inicializar Stripe dinamicamente apenas quando configurado
const getStripeInstance = async () => {
  if (!isStripeConfigured()) {
    throw new Error('Stripe não configurado');
  }

  const Stripe = (await import('stripe')).default;
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
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
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Buscar usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { company: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const { planId, trial = false } = await request.json();

    // Verificar se o plano existe
    if (!PLANS[planId]) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }

    const plan = PLANS[planId];

    // Obter instância do Stripe
    const stripe = await getStripeInstance();

    // Criar sessão de checkout do Stripe com UI embutida
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'embedded', // Modo embedded para checkout integrado
      payment_method_types: ['card'], // Apenas cartões (Link requer ativação no dashboard)
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: plan.currency,
            product_data: {
              name: `Plano ${plan.name} - Atendimento BR`,
              description: `Automação WhatsApp - Plano ${plan.name}`,
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

      // URL de retorno para modo embedded
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,

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
      clientSecret: session.client_secret
    });

  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    return NextResponse.json({
      error: 'Erro ao criar sessão de pagamento',
      details: error.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
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