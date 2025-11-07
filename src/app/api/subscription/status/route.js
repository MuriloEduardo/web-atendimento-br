import { NextResponse } from 'next/server';
import { extractAuthToken, createAuthErrorResponse } from '@/lib/authMiddleware';
import prisma from '@/lib/prisma';
import { PLANS } from '@/lib/plans';

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

    // Buscar company do usuário
    const company = await prisma.company.findFirst({
      where: { ownerId: tokenUser.userId },
      select: {
        id: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCustomerId: true,
        status: true,
        paymentSetup: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!company) {
      return NextResponse.json({
        hasSubscription: false,
        subscriptionStatus: 'inactive',
        message: 'Empresa não encontrada'
      });
    }

    // Verificar se tem assinatura ativa (paymentSetup true OU stripeSubscriptionId preenchido)
    const hasActiveSubscription = company.paymentSetup || company.stripeSubscriptionId;

    if (!hasActiveSubscription) {
      return NextResponse.json({
        hasSubscription: false,
        subscriptionStatus: 'inactive',
        message: 'Usuário não possui assinatura ativa'
      });
    }

    // Determinar qual plano baseado no priceId
    const currentPlan = Object.values(PLANS).find(
      plan => plan.id === company.stripePriceId || plan.stripePriceId === company.stripePriceId
    );

    return NextResponse.json({
      hasSubscription: true,
      subscription: {
        id: company.stripeSubscriptionId || company.id,
        stripeSubscriptionId: company.stripeSubscriptionId,
        planId: currentPlan?.id || company.stripePriceId || 'unknown',
        planName: currentPlan?.name || 'Desconhecido',
        price: currentPlan?.price || 0,
        features: currentPlan?.features || [],
        status: company.status === 'active' ? 'active' : company.status,
        paymentSetup: company.paymentSetup,
        createdAt: company.createdAt
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