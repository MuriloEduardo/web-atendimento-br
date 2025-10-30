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

    if (user.onboardingCompleted) {
      return NextResponse.json({
        completed: true,
        currentStep: 0,
        completedSteps: []
      });
    }

    return NextResponse.json({
      completed: false,
      currentStep: user.onboardingStep || 0,
      completedSteps: user.completedSteps || []
    });

  } catch (error) {
    console.error('Erro ao buscar progresso do onboarding:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}