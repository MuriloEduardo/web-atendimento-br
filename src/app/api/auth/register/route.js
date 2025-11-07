import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateJWT, isValidEmail, validatePassword, generateRandomToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // Validações básicas
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar formato do email
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Validar força da senha
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'Senha não atende aos requisitos', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 409 }
      );
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Gerar token de verificação de email
    const emailVerificationToken = generateRandomToken();

    // Criar novo usuário no banco
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        emailVerificationToken,
        isEmailVerified: false,
        profileComplete: false,
        onboardingComplete: false,
        subscriptionStatus: 'inactive'
      },
      select: {
        id: true,
        name: true,
        email: true,
        isEmailVerified: true,
        profileComplete: true,
        onboardingComplete: true,
        subscriptionStatus: true,
        createdAt: true
      }
    });

    // Gerar JWT token
    const token = generateJWT({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name
    });

    return NextResponse.json({
      token,
      user: newUser,
      message: 'Usuário criado com sucesso! Verifique seu email para ativar a conta.'
    }, { status: 201 });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}