import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch('http://localhost:7000/api/localidades');

        if (!response.ok) {
            throw new Error('Erro ao buscar localidades');
        }

        const data = await response.json();

        // Agrupar por UF e CN (código nacional)
        const localidadesPorUF = {};

        if (data.success && Array.isArray(data.data)) {
            data.data.forEach(loc => {
                const uf = loc.UF || 'Outros';
                if (!localidadesPorUF[uf]) {
                    localidadesPorUF[uf] = [];
                }
                localidadesPorUF[uf].push({
                    areaLocal: loc.AREA_LOCAL,
                    localidade: loc.LOCALIDADE,
                    cn: loc.CN,
                    valorMensal: parseFloat(loc.VALOR_MENSAL),
                    valorInstalacao: parseFloat(loc.VALOR_INSTALACAO)
                });
            });
        }

        return NextResponse.json({
            success: true,
            data: localidadesPorUF
        });
    } catch (error) {
        console.error('Erro ao buscar localidades:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
