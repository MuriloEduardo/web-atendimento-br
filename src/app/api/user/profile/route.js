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

    // Buscar usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { id: tokenUser.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        businessName: true,
        businessType: true,
        website: true,
        isEmailVerified: true,
        profileComplete: true,
        onboardingComplete: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return createAuthErrorResponse('Usuário não encontrado');
    }

    return NextResponse.json(user);

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    // Verificar e extrair token
    const { user: tokenUser, error } = extractAuthToken(request);

    if (error) {
      return createAuthErrorResponse(error);
    }

    if (!tokenUser || !tokenUser.userId) {
      return createAuthErrorResponse('Token inválido');
    }

    // Parsing do corpo da requisição
    const data = await request.json();

    // Validar dados que podem ser atualizados
    const updateData = {};

    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }

    if (data.phoneNumber !== undefined) {
      updateData.phoneNumber = data.phoneNumber;
    }

    if (data.businessName !== undefined) {
      updateData.businessName = data.businessName;
    }

    if (data.businessType !== undefined) {
      updateData.businessType = data.businessType;
    }

    if (data.website !== undefined) {
      updateData.website = data.website;
    }

    if (data.profileComplete !== undefined) {
      updateData.profileComplete = Boolean(data.profileComplete);
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: tokenUser.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        businessName: true,
        businessType: true,
        website: true,
        isEmailVerified: true,
        profileComplete: true,
        onboardingComplete: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}