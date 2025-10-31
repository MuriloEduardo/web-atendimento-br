import { NextResponse } from 'next/server';
import db from '@/lib/mockDb';

export async function GET(request) {
  try {
    // Verificar token de autenticação
    const authHeader = request.headers.get('authorization');
    const user = db.getUserFromToken(authHeader);
    
    if (!user) {
      return NextResponse.json({ error: 'Token inválido ou não fornecido' }, { status: 401 });
    }

    const userId = user.id;

    // Buscar assinatura do usuário
    const subscription = db.getSubscriptionByUserId(userId);

    if (!subscription) {
      return NextResponse.json({
        hasSubscription: false,
        status: 'none',
        message: 'Usuário não possui assinatura ativa'
      });
    }

    // Verificar se o trial expirou
    const now = new Date();
    const trialEnd = new Date(subscription.trialEnd);
    
    if (subscription.status === 'trialing' && now > trialEnd) {
      // Trial expirou, seria necessário processar pagamento em aplicação real
      db.updateSubscription(subscription.id, { status: 'past_due' });
      subscription.status = 'past_due';
    }

    // Calcular dias restantes do trial
    let daysLeft = 0;
    if (subscription.status === 'trialing') {
      const diffTime = trialEnd - now;
      daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return NextResponse.json({
      hasSubscription: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        planId: subscription.planId,
        planName: subscription.planName,
        price: subscription.price,
        currency: subscription.currency,
        trialEnd: subscription.trialEnd,
        currentPeriodEnd: subscription.currentPeriodEnd,
        features: subscription.features,
        daysLeft: daysLeft
      }
    });

  } catch (error) {
    console.error('Erro ao buscar status da assinatura:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}