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

    // Completar onboarding
    db.updateUser(user.id, {
      onboardingCompleted: true,
      needsOnboarding: false,
      onboardingCompletedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Onboarding completado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao completar onboarding:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}