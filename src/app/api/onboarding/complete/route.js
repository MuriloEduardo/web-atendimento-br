import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractAuthToken, createAuthErrorResponse } from '@/lib/authMiddleware';

export async function POST(request) {
  try {
    // Verificar e extrair token
    const { user: tokenUser, error } = extractAuthToken(request);

    if (error) {
      return createAuthErrorResponse(error);
    }

    if (!tokenUser || !tokenUser.userId) {
      return createAuthErrorResponse('Token inválido');
    }

    // Buscar usuário e empresa
    const user = await prisma.user.findUnique({
      where: { id: tokenUser.userId },
      select: {
        profileComplete: true,
        isEmailVerified: true,
        subscriptionStatus: true,
        company: {
          select: {
            id: true,
            stripeCustomerId: true,
            paymentSetup: true,
            profileSetup: true,
            whatsappSetup: true,
            automationSetup: true,
            setupProgress: true
          }
        }
      }
    });

    if (!user) {
      return createAuthErrorResponse('Usuário não encontrado');
    }

    // Verificar se todos os passos foram completos
    if (!user.profileComplete || !user.isEmailVerified) {
      return NextResponse.json(
        { error: 'Complete seu perfil e verifique seu email antes de finalizar.' },
        { status: 409 }
      );
    }

    // Verificar se empresa existe
    if (!user.company) {
      return NextResponse.json(
        { error: 'Empresa não configurada. Crie uma empresa para continuar.' },
        { status: 409 }
      );
    }

    // Verificar se Stripe está configurado (apenas em produção)
    // Em desenvolvimento, permitir completar onboarding sem Stripe
    const isProduction = process.env.NODE_ENV === 'production';
    const stripeEnabled = process.env.STRIPE_SECRET_KEY;
    
    if (isProduction && stripeEnabled && (!user.company.stripeCustomerId || !user.company.paymentSetup)) {
      return NextResponse.json(
        { error: 'Configure seu método de pagamento (Stripe) antes de completar o onboarding.' },
        { status: 409 }
      );
    }

    // Marcar onboarding como completo
    const updatedUser = await prisma.user.update({
      where: { id: tokenUser.userId },
      data: { onboardingComplete: true },
      select: {
        id: true,
        name: true,
        email: true,
        onboardingComplete: true,
        profileComplete: true
      }
    });

    return NextResponse.json({
      user: updatedUser,
      message: 'Onboarding completado com sucesso'
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao completar onboarding:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}