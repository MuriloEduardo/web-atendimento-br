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

    const automationConfig = await request.json();

    // Salvar configurações da automação
    db.updateUser(user.id, {
      automationConfig: {
        ...user.automationConfig,
        ...automationConfig
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Configurações de automação salvas com sucesso'
    });

  } catch (error) {
    console.error('Erro ao salvar configurações de automação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}