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

    const businessInfo = await request.json();

    // Atualizar informações da empresa
    db.updateUser(user.id, {
      businessInfo: {
        ...user.businessInfo,
        ...businessInfo
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Informações da empresa salvas com sucesso'
    });

  } catch (error) {
    console.error('Erro ao salvar informações da empresa:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}