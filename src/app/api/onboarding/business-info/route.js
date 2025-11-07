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

    // Validações básicas
    if (!data.businessName) {
      return NextResponse.json(
        { error: 'Nome do negócio é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar ou criar empresa
    let company = await prisma.company.findUnique({
      where: { ownerId: tokenUser.userId }
    });

    if (!company) {
      // Criar empresa se não existir
      company = await prisma.company.create({
        data: {
          name: data.businessName,
          type: data.businessType,
          website: data.website,
          owner: { connect: { id: tokenUser.userId } },
          profileSetup: true
        }
      });

      // Atualizar referência de companyId do usuário
      await prisma.user.update({
        where: { id: tokenUser.userId },
        data: { companyId: company.id }
      });
    } else {
      // Atualizar empresa existente
      company = await prisma.company.update({
        where: { id: company.id },
        data: {
          name: data.businessName,
          type: data.businessType,
          website: data.website,
          email: data.email,
          phoneNumber: data.phoneNumber,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          registrationNumber: data.registrationNumber,
          registrationType: data.registrationType,
          businessCategory: data.businessCategory,
          employees: data.employees,
          profileSetup: true,
          setupProgress: Math.round(((true ? 1 : 0) + (company.whatsappSetup ? 1 : 0) + (company.paymentSetup ? 1 : 0) + (company.automationSetup ? 1 : 0)) / 4 * 100)
        },
        select: {
          id: true,
          name: true,
          type: true,
          website: true,
          profileSetup: true,
          setupProgress: true
        }
      });
    }

    // Atualizar usuário também
    const updatedUser = await prisma.user.update({
      where: { id: tokenUser.userId },
      data: {
        businessName: data.businessName,
        businessType: data.businessType,
        website: data.website,
        profileComplete: true  // Marcar perfil como completo
      },
      select: {
        id: true,
        businessName: true,
        businessType: true,
        website: true,
        profileComplete: true,
        company: {
          select: {
            id: true,
            profileSetup: true,
            setupProgress: true
          }
        }
      }
    });

    return NextResponse.json({
      user: updatedUser,
      company,
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