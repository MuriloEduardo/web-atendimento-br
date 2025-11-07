import { NextResponse } from 'next/server';
import { extractAuthToken, createAuthErrorResponse } from '@/lib/authMiddleware';
import prisma from '@/lib/prisma';
import { plans } from '@/lib/plans';

export async function GET(request) {
  try {
    // Verificar e extrair token
    const { user: tokenUser, error } = extractAuthToken(request);

    if (error) {
      return createAuthErrorResponse(error);
    }

    if (!tokenUser || !tokenUser.userId) {
      return createAuthErrorResponse('Token inválido');
    }

    // Buscar usuário e company com assinatura
    const company = await prisma.company.findFirst({
      where: { ownerId: tokenUser.userId },
      select: {
        id: true,
        subscriptionId: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        trialEndDate: true
      }
    });

    if (!company || !company.subscriptionId) {
      return NextResponse.json({
        hasSubscription: false,
        subscriptionStatus: 'inactive',
        message: 'Usuário não possui assinatura ativa'
      });
    }

    // Buscar assinatura no Stripe ou no banco
    const subscription = await prisma.subscription.findUnique({
      where: { id: company.subscriptionId },
      select: {
        id: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        status: true,
        currentPeriodStart: true,
        currentPeriodEnd: true,
        cancelAtPeriodEnd: true,
        createdAt: true
      }
    });

    if (!subscription) {
      return NextResponse.json({
        hasSubscription: false,
        subscriptionStatus: 'inactive',
        message: 'Assinatura não encontrada'
      });
    }

    // Determinar qual plano baseado no priceId
    const currentPlan = Object.values(plans).find(
      plan => plan.stripePriceId === subscription.stripePriceId
    );

    return NextResponse.json({
      hasSubscription: true,
      subscription: {
        id: subscription.id,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        planId: currentPlan?.id || 'unknown',
        planName: currentPlan?.name || 'Desconhecido',
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        trialEnd: company.trialEndDate,
        createdAt: subscription.createdAt
      }
    });

  } catch (error) {
    console.error('Erro ao verificar status de assinatura:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}