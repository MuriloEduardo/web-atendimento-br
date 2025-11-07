import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractAuthToken, createAuthErrorResponse } from '@/lib/authMiddleware';

export async function GET(request) {
  try {
    const { user: tokenUser, error } = extractAuthToken(request);

    if (error) {
      return createAuthErrorResponse(error);
    }

    if (!tokenUser || !tokenUser.userId) {
      return createAuthErrorResponse('Token inválido');
    }

    const company = await prisma.company.findUnique({
      where: { ownerId: tokenUser.userId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ company }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
