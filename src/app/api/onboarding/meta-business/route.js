import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-dev-only';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const { businessId, whatsappBusinessAccountId, phoneNumberId, accessToken } = await request.json();

    if (!businessId || !whatsappBusinessAccountId || !phoneNumberId || !accessToken) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar o usuário e sua empresa
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { company: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    if (!user.company) {
      return NextResponse.json(
        { error: 'Empresa não encontrada. Crie uma empresa primeiro.' },
        { status: 400 }
      );
    }

    // Atualizar a empresa com as informações do Meta Business
    await prisma.company.update({
      where: { id: user.company.id },
      data: {
        metaBusinessId: businessId,
        whatsappBusinessAccountId: whatsappBusinessAccountId,
        phoneNumberId: phoneNumberId,
        metaAccessToken: accessToken,
        whatsappVerified: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Informações do Meta Business salvas com sucesso'
    }, { status: 200 });

  } catch (error) {
    console.error('Erro ao salvar informações do Meta Business:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}