import { NextResponse } from 'next/server';
import { PLANS } from '@/lib/plans';

/**
 * GET /api/plans
 * Retorna todos os planos disponíveis
 */
export async function GET(request) {
  try {
    // Converter PLANS object para array
    const plans = Object.values(PLANS);

    return NextResponse.json(
      {
        plans,
        total: plans.length,
        message: 'Planos disponíveis'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[GET /api/plans] Erro:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar planos', details: error.message },
      { status: 500 }
    );
  }
}
