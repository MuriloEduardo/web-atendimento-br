import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-dev-only';

const getStripeInstance = async () => {
  const Stripe = (await import('stripe')).default;
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16'
  });
};

export async function POST(request) {
  try {
    console.log('🔍 [ACTIVATE] Iniciando ativação de assinatura...');

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      console.error('❌ [ACTIVATE] Token não fornecido');
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ [ACTIVATE] Token válido, userId:', decoded.userId);
    } catch (error) {
      console.error('❌ [ACTIVATE] Token inválido:', error.message);
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { sessionId } = await request.json();
    console.log('📋 [ACTIVATE] SessionId recebido:', sessionId);

    if (!sessionId) {
      console.error('❌ [ACTIVATE] sessionId não fornecido');
      return NextResponse.json({ error: 'sessionId é obrigatório' }, { status: 400 });
    }

    console.log('🔍 [ACTIVATE] Buscando sessão no Stripe...');
    const stripe = await getStripeInstance();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      console.error('❌ [ACTIVATE] Sessão não encontrada no Stripe');
      return NextResponse.json({ error: 'Sessão não encontrada' }, { status: 404 });
    }

    console.log('✅ [ACTIVATE] Sessão encontrada, payment_status:', session.payment_status);

    if (session.payment_status !== 'paid') {
      console.error('❌ [ACTIVATE] Pagamento não aprovado ainda:', session.payment_status);
      return NextResponse.json({ error: 'Pagamento ainda não aprovado' }, { status: 409 });
    }

    // Buscar ou criar empresa do usuário
    console.log('🔍 [ACTIVATE] Buscando empresa do usuário...');
    let company = await prisma.company.findFirst({
      where: { ownerId: decoded.userId }
    });

    if (!company) {
      console.log('⚠️ [ACTIVATE] Empresa não encontrada, criando nova...');
      company = await prisma.company.create({
        data: {
          ownerId: decoded.userId,
          name: 'Minha Empresa',
          status: 'active'
        }
      });
      console.log('✅ [ACTIVATE] Empresa criada, id:', company.id);
    } else {
      console.log('✅ [ACTIVATE] Empresa encontrada, id:', company.id);
    }

    // Atualizar empresa como ativa e marcar pagamento como concluído
    console.log('🔄 [ACTIVATE] Atualizando empresa...');
    const updatedCompany = await prisma.company.update({
      where: { id: company.id },
      data: {
        status: 'active',
        paymentSetup: true,
        stripePriceId: session.metadata?.planId || 'starter'
      }
    });

    console.log('✅ Assinatura ativada:', {
      companyId: updatedCompany.id,
      paymentSetup: updatedCompany.paymentSetup,
      status: updatedCompany.status,
      stripePriceId: updatedCompany.stripePriceId
    });

    return NextResponse.json({
      success: true,
      message: 'Assinatura ativada com sucesso',
      company: {
        id: updatedCompany.id,
        status: updatedCompany.status,
        paymentSetup: updatedCompany.paymentSetup,
        stripePriceId: updatedCompany.stripePriceId
      }
    });

  } catch (error) {
    console.error('❌ [ACTIVATE] Erro ao ativar assinatura:', error);
    console.error('❌ [ACTIVATE] Stack:', error.stack);
    return NextResponse.json({
      error: 'Erro ao ativar assinatura',
      details: error.message
    }, { status: 500 });
  }
  // Não desconectar o Prisma - o singleton gerencia a conexão
}
