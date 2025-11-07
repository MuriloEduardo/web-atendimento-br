import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-dev-only';

export async function GET(request) {
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

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        company: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const company = user.company;

    const steps = {
      company: {
        completed: !!company,
        companyId: company?.id || null,
        companyName: company?.name || null
      },
      whatsapp: {
        completed: !!company?.whatsappNumber,
        number: company?.whatsappNumber || null,
        brdidNumber: company?.brdidNumber || null
      },
      meta: {
        completed: !!company?.metaBusinessId,
        businessId: company?.metaBusinessId || null,
        whatsappBusinessAccountId: company?.whatsappBusinessAccountId || null
      },
      payment: {
        completed: company?.status === 'active',
        subscriptionStatus: company?.status || null,
        planId: company?.stripePriceId || null
      }
    };

    const allComplete = steps.company.completed && 
                       steps.whatsapp.completed && 
                       steps.meta.completed && 
                       steps.payment.completed;

    return NextResponse.json({
      steps,
      allComplete,
      userId: user.id,
      email: user.email
    });

  } catch (error) {
    console.error('Erro ao buscar status do onboarding:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar status do onboarding' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
