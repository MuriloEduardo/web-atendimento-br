import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { extractAuthToken, createAuthErrorResponse } from '@/lib/authMiddleware';
import { createStripeCustomer } from '@/lib/stripeHelper';

/**
 * POST /api/company/stripe/setup
 * Configura Stripe para a empresa (cria customer no Stripe)
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

    // Se já tem Stripe customer, retornar o existente
    if (company.stripeCustomerId) {
      return NextResponse.json({
        company: {
          id: company.id,
          stripeCustomerId: company.stripeCustomerId,
          status: company.status
        },
        message: 'Empresa já possui Stripe customer configurado'
      }, { status: 200 });
    }

    // Criar customer no Stripe
    try {
      const stripeCustomer = await createStripeCustomer(company);

      // Atualizar empresa com Stripe customer ID
      const updatedCompany = await prisma.company.update({
        where: { id: company.id },
        data: {
          stripeCustomerId: stripeCustomer.id,
          paymentSetup: true,
          setupProgress: Math.round(((company.profileSetup ? 1 : 0) + (company.whatsappSetup ? 1 : 0) + 1 + (company.automationSetup ? 1 : 0)) / 4 * 100)
        },
        select: {
          id: true,
          name: true,
          stripeCustomerId: true,
          setupProgress: true,
          status: true,
          paymentSetup: true
        }
      });

      return NextResponse.json({
        company: updatedCompany,
        stripeCustomer: {
          id: stripeCustomer.id,
          email: stripeCustomer.email
        },
        message: 'Stripe configurado com sucesso'
      }, { status: 201 });

    } catch (stripeError) {
      console.error('Erro ao configurar Stripe:', stripeError);
      return NextResponse.json(
        { error: 'Erro ao configurar Stripe: ' + stripeError.message },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Erro ao configurar Stripe:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
