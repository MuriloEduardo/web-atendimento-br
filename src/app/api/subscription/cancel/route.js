import { NextResponse } from 'next/server';
import db from '@/lib/mockDb';

export async function POST(request) {
  try {
    // Verificar token de autenticação
    const authHeader = request.headers.get('authorization');
    const user = db.getUserFromToken(authHeader);
    
    if (!user) {
      return NextResponse.json({ error: 'Token inválido ou não fornecido' }, { status: 401 });
    }

    const userId = user.id;

    // Buscar assinatura ativa do usuário
    const subscription = db.getSubscriptionByUserId(userId);

    if (!subscription) {
      return NextResponse.json({ error: 'Assinatura não encontrada' }, { status: 404 });
    }

    // Cancelar assinatura
    db.updateSubscription(subscription.id, {
      status: 'canceled',
      canceledAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Assinatura cancelada com sucesso. Você pode continuar usando até o final do período pago.'
    });

  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}