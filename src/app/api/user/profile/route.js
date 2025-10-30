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

    // Retornar dados do usuário sem a senha
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}