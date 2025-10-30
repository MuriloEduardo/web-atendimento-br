import { NextResponse } from 'next/server';
import db from '@/lib/mockDb';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = db.getUserFromToken(authHeader);

    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Simular reenvio de email
    console.log(`Reenviando email de verificação para: ${user.email}`);

    return NextResponse.json({
      success: true,
      message: 'Email de verificação reenviado'
    });

  } catch (error) {
    console.error('Erro ao reenviar email:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}