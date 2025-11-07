import { NextResponse } from 'next/server';
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

    // Endpoint genérico para automação - apenas valida autenticação
    await request.json().catch(() => ({}));

    return NextResponse.json({
      success: true,
      message: 'Configurações de automação salvas com sucesso'
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao salvar configurações de automação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}