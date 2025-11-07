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
    if (!data.name) {
      return NextResponse.json(
        { error: 'Nome da empresa é obrigatório' },
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
          name: data.name,
          registrationNumber: data.cnpj,
          phoneNumber: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
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
          name: data.name,
          registrationNumber: data.cnpj,
          phoneNumber: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          profileSetup: true
        }
      });
    }

    // Atualizar usuário também se necessário
    await prisma.user.update({
      where: { id: tokenUser.userId },
      data: {
        profileComplete: true
      }
    });

    return NextResponse.json({
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