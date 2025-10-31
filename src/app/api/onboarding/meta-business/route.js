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

    const metaBusinessInfo = await request.json();

    // Salvar informações do Meta Business
    db.updateUser(user.id, {
      metaBusiness: {
        ...user.metaBusiness,
        ...metaBusinessInfo
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Informações do Meta Business salvas com sucesso'
    });

  } catch (error) {
    console.error('Erro ao salvar informações do Meta Business:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}