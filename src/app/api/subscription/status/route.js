import { NextResponse } from 'next/server';
import { extractAuthToken, createAuthErrorResponse } from '@/lib/authMiddleware';

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

    return NextResponse.json({
      hasSubscription: false,
      subscriptionStatus: 'inactive',
      message: 'Usuário não possui assinatura ativa',
      plan: null
    });
    
  } catch (error) {
    console.error('Erro ao verificar status de assinatura:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}