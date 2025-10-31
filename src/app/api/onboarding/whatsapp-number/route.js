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

    const { numberChoice, purchaseChoice } = await request.json();

    // Salvar escolha do número do WhatsApp
    db.updateUser(user.id, {
      whatsappNumber: {
        choice: numberChoice,
        purchaseChoice: purchaseChoice || null
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Configuração do número do WhatsApp salva com sucesso'
    });

  } catch (error) {
    console.error('Erro ao salvar configuração do WhatsApp:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}