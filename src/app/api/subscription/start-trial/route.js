import { NextResponse } from 'next/server';
import db from '@/lib/mockDb';
import { PLANS } from '@/lib/plans';

export async function POST(request) {
  try {
    // Verificar token de autenticação
    const authHeader = request.headers.get('authorization');
    const user = db.getUserFromToken(authHeader);
    
    if (!user) {
      return NextResponse.json({ error: 'Token inválido ou não fornecido' }, { status: 401 });
    }

    const { planId } = await request.json();

    // Verificar se o plano existe
    if (!PLANS[planId]) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }

    const plan = PLANS[planId];
    const userId = user.id;

    // Verificar se o usuário já tem uma assinatura ativa
    const existingSubscription = db.getSubscriptionByUserId(userId);

    if (existingSubscription) {
      return NextResponse.json({ error: 'Usuário já possui assinatura ativa' }, { status: 400 });
    }

    // Criar período de trial de 7 dias
    const trialStart = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);

    // Criar nova assinatura com trial
    const newSubscription = db.createSubscription({
      userId: userId,
      planId: planId,
      planName: plan.name,
      price: plan.price,
      currency: plan.currency,
      status: 'trialing',
      trialStart: trialStart.toISOString(),
      trialEnd: trialEnd.toISOString(),
      currentPeriodStart: trialStart.toISOString(),
      currentPeriodEnd: trialEnd.toISOString(),
      features: plan.features
    });

    // Atualizar usuário com informações de assinatura
    db.updateUser(userId, {
      subscriptionId: newSubscription.id,
      subscriptionStatus: 'trialing',
      planId: planId,
      subscriptionActive: false
    });

    return NextResponse.json({
      success: true,
      subscription: {
        id: newSubscription.id,
        status: newSubscription.status,
        planId: newSubscription.planId,
        planName: newSubscription.planName,
        trialEnd: newSubscription.trialEnd,
        features: newSubscription.features
      },
      message: 'Trial iniciado com sucesso! Você tem 7 dias para testar todas as funcionalidades.'
    });

  } catch (error) {
    console.error('Erro ao iniciar trial:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}