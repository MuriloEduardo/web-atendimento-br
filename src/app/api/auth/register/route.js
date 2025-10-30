import { NextResponse } from 'next/server';
import db from '@/lib/mockDb';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 409 }
      );
    }

    // Criar novo usuário
    const newUser = db.createUser({
      name,
      email,
      password, // Em produção seria hasheada
      needsOnboarding: true,
      onboardingStep: 0,
      onboardingCompleted: false,
      emailVerified: false,
      profile: {
        company: '',
        phone: '',
        website: ''
      },
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true
      }
    });

    // Gerar token mock
    const token = `mock_token_${newUser.id}_${Date.now()}`;

    // Retornar dados do usuário sem a senha
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      token,
      user: userWithoutPassword
    }, { status: 201 });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}