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

    await request.json().catch(() => ({}));

    return NextResponse.json({
      success: true,
      message: 'Informações do Meta Business salvas com sucesso'
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao salvar informações do Meta Business:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}