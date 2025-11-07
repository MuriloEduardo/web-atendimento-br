import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: tokenUser.userId },
      select: {
        id: true,
        email: true,
        isEmailVerified: true,
        createdAt: true
      }
    });

    if (!user) {
      return createAuthErrorResponse('Usuário não encontrado');
    }

    // Simular verificação de email - em produção seria uma verificação real
    // Para demo, consideramos verificado após 5 segundos do cadastro
    const timeSinceCreation = Date.now() - new Date(user.createdAt).getTime();
    const isVerified = timeSinceCreation > 5000 || user.isEmailVerified;

    if (isVerified && !user.isEmailVerified) {
      await prisma.user.update({
        where: { id: tokenUser.userId },
        data: { isEmailVerified: true }
      });
    }

    return NextResponse.json({
      verified: isVerified,
      email: user.email,
      message: isVerified ? 'Email verificado com sucesso' : 'Email não verificado ainda'
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao verificar email:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}