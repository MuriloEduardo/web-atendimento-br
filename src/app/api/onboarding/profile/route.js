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

    const profileData = await request.json();

    // Atualizar perfil do usuário
    db.updateUser(user.id, {
      profile: {
        ...user.profile,
        ...profileData
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Perfil atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao salvar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}