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

    // Construir objeto de dados apenas com campos não-vazios
    const updateData = {
      profileComplete: true
    };

    if (data.name) updateData.name = data.name;
    if (data.phoneNumber) updateData.phoneNumber = data.phoneNumber;
    if (data.businessName) updateData.businessName = data.businessName;
    if (data.businessType) updateData.businessType = data.businessType;
    if (data.website) updateData.website = data.website;

    // Atualizar perfil do usuário no onboarding
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
        profileComplete: true,
        onboardingComplete: true
      }
    });

    return NextResponse.json({
      user: updatedUser,
      message: 'Perfil atualizado com sucesso'
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao salvar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}