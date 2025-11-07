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

    const data = await request.json().catch(() => ({}));

    // Validar número de WhatsApp
    if (!data.whatsappNumber) {
      return NextResponse.json(
        { error: 'Número do WhatsApp é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar empresa
    let company = await prisma.company.findUnique({
      where: { ownerId: tokenUser.userId }
    });

    if (!company) {
      return NextResponse.json(
        { error: 'Empresa não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar empresa com dados do WhatsApp
    company = await prisma.company.update({
      where: { id: company.id },
      data: {
        whatsappNumber: data.whatsappNumber,
        whatsappVerified: true, // Simular verificação por enquanto
        whatsappSetup: true,
        setupProgress: Math.round(((company.profileSetup ? 1 : 0) + 1 + (company.paymentSetup ? 1 : 0) + (company.automationSetup ? 1 : 0)) / 4 * 100)
      },
      select: {
        id: true,
        whatsappNumber: true,
        whatsappVerified: true,
        whatsappSetup: true,
        setupProgress: true
      }
    });

    return NextResponse.json({
      company,
      message: 'Configuração do número do WhatsApp salva com sucesso'
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao salvar configuração do WhatsApp:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}