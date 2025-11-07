import { NextResponse } from 'next/server';
import { extractAuthToken, createAuthErrorResponse } from '@/lib/authMiddleware';
import { getOnboardingProgress } from '@/lib/onboardingHelper';

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

    // Obter progresso
    const progress = await getOnboardingProgress(tokenUser.userId);

    if (!progress) {
      return createAuthErrorResponse('Usuário não encontrado');
    }

    return NextResponse.json({
      ...progress,
      message: 'Progresso do onboarding obtido com sucesso'
    });

  } catch (error) {
    console.error('Erro ao buscar progresso do onboarding:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}