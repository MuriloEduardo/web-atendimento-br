import { NextResponse } from 'next/server';
import db from '@/lib/mockDb';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar usuário por email
    const user = db.getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      );
    }

    // Verificar senha (em produção seria com hash)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Senha incorreta' },
        { status: 401 }
      );
    }

    // Gerar token mock (em produção seria JWT real)
    const token = `mock_token_${user.id}_${Date.now()}`;

    // Retornar dados do usuário sem a senha
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}