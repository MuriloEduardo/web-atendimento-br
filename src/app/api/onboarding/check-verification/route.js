import { NextResponse } from 'next/server';
import db from '@/lib/mockDb';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const user = db.getUserFromToken(authHeader);

    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Simular verificação de email - em produção seria uma verificação real
    // Para demo, consideramos verificado após 5 segundos do cadastro
    const timeSinceCreation = Date.now() - new Date(user.createdAt).getTime();
    const isVerified = timeSinceCreation > 5000; // 5 segundos para demo

    if (isVerified && !user.emailVerified) {
      db.updateUser(user.id, { emailVerified: true });
    }

    return NextResponse.json({
      verified: isVerified
    });

  } catch (error) {
    console.error('Erro ao verificar email:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}