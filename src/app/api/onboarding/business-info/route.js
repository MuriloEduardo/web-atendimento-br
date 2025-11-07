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

    const data = await request.json();

    // Atualizar informações da empresa
    const updatedUser = await prisma.user.update({
      where: { id: tokenUser.userId },
      data: {
        businessName: data.businessName || undefined,
        businessType: data.businessType || undefined,
        website: data.website || undefined
      },
      select: {
        id: true,
        businessName: true,
        businessType: true,
        website: true
      }
    });

    return NextResponse.json({
      user: updatedUser,
      message: 'Informações da empresa salvas com sucesso'
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao salvar informações da empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}