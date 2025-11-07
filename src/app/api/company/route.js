import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractAuthToken, createAuthErrorResponse } from '@/lib/authMiddleware';

/**
 * GET /api/company
 * Retorna dados da empresa do usuário autenticado
 */
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
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        description: true,
        website: true,
        phoneNumber: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        whatsappNumber: true,
        whatsappVerified: true,
        stripeCustomerId: true,
        status: true,
        setupProgress: true,
        profileSetup: true,
        whatsappSetup: true,
        paymentSetup: true,
        automationSetup: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      company,
      message: 'Empresa obtida com sucesso'
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/company
 * Cria ou atualiza a empresa do usuário
 */
export async function POST(request) {
  try {
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

    // Verificar se empresa já existe
    const existingCompany = await prisma.company.findUnique({
      where: { ownerId: tokenUser.userId }
    });

    let company;

    if (existingCompany) {
      // Atualizar empresa existente
      company = await prisma.company.update({
        where: { id: existingCompany.id },
        data: {
          name: data.name || undefined,
          email: data.email || undefined,
          type: data.type || undefined,
          description: data.description || undefined,
          website: data.website || undefined,
          phoneNumber: data.phoneNumber || undefined,
          address: data.address || undefined,
          city: data.city || undefined,
          state: data.state || undefined,
          zipCode: data.zipCode || undefined,
          country: data.country || undefined,
          whatsappNumber: data.whatsappNumber || undefined,
          registrationNumber: data.registrationNumber || undefined,
          registrationType: data.registrationType || undefined,
          businessCategory: data.businessCategory || undefined,
          employees: data.employees || undefined,
          profileSetup: data.profileSetup !== undefined ? data.profileSetup : undefined
        },
        select: {
          id: true,
          name: true,
          email: true,
          type: true,
          description: true,
          website: true,
          status: true,
          setupProgress: true
        }
      });
    } else {
      // Criar nova empresa
      company = await prisma.company.create({
        data: {
          name: data.name,
          email: data.email,
          type: data.type,
          description: data.description,
          website: data.website,
          phoneNumber: data.phoneNumber,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
          whatsappNumber: data.whatsappNumber,
          registrationNumber: data.registrationNumber,
          registrationType: data.registrationType,
          businessCategory: data.businessCategory,
          employees: data.employees,
          owner: {
            connect: { id: tokenUser.userId }
          }
        },
        select: {
          id: true,
          name: true,
          email: true,
          type: true,
          status: true,
          setupProgress: true
        }
      });

      // Atualizar referência do usuário à empresa
      await prisma.user.update({
        where: { id: tokenUser.userId },
        data: { companyId: company.id }
      });
    }

    return NextResponse.json({
      company,
      message: existingCompany ? 'Empresa atualizada com sucesso' : 'Empresa criada com sucesso'
    }, { status: existingCompany ? 200 : 201 });

  } catch (error) {
    console.error('Erro ao criar/atualizar empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/company/:id/progress
 * Atualiza o progresso de setup da empresa
 */
export async function PUT(request) {
  try {
    const { user: tokenUser, error } = extractAuthToken(request);

    if (error) {
      return createAuthErrorResponse(error);
    }

    if (!tokenUser || !tokenUser.userId) {
      return createAuthErrorResponse('Token inválido');
    }

    const data = await request.json();

    // Buscar empresa do usuário
    const company = await prisma.company.findUnique({
      where: { ownerId: tokenUser.userId }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Calcular progresso baseado nos passos completos
    let setupProgress = 0;
    const steps = [];

    if (data.profileSetup) steps.push('profile');
    if (data.whatsappSetup) steps.push('whatsapp');
    if (data.paymentSetup) steps.push('payment');
    if (data.automationSetup) steps.push('automation');

    setupProgress = Math.round((steps.length / 4) * 100);

    // Atualizar empresa
    const updatedCompany = await prisma.company.update({
      where: { id: company.id },
      data: {
        profileSetup: data.profileSetup !== undefined ? data.profileSetup : undefined,
        whatsappSetup: data.whatsappSetup !== undefined ? data.whatsappSetup : undefined,
        paymentSetup: data.paymentSetup !== undefined ? data.paymentSetup : undefined,
        automationSetup: data.automationSetup !== undefined ? data.automationSetup : undefined,
        setupProgress: setupProgress,
        status: setupProgress === 100 ? 'active' : 'setup'
      },
      select: {
        id: true,
        name: true,
        setupProgress: true,
        status: true,
        profileSetup: true,
        whatsappSetup: true,
        paymentSetup: true,
        automationSetup: true
      }
    });

    return NextResponse.json({
      company: updatedCompany,
      message: 'Progresso atualizado com sucesso'
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao atualizar progresso:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}