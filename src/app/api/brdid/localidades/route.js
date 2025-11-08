import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const BRDID_API_URL = process.env.BRDID_API_URL;
        
        if (!BRDID_API_URL) {
            return NextResponse.json({
                success: false,
                error: 'BRDID_API_URL não configurada'
            }, { status: 500 });
        }

        const response = await fetch(`${BRDID_API_URL}/api/localidades`);

        if (!response.ok) {
            throw new Error('Erro ao buscar localidades');
        }

        const data = await response.json();

        // Transformar os dados para o formato esperado pelo frontend
        const locations = [];

        if (data.success && Array.isArray(data.data)) {
            // Agrupar por área local para evitar duplicatas
            const uniqueLocations = new Map();
            
            data.data.forEach(loc => {
                const key = loc.AREA_LOCAL;
                if (!uniqueLocations.has(key)) {
                    uniqueLocations.set(key, {
                        code: loc.AREA_LOCAL,
                        name: `${loc.LOCALIDADE} - ${loc.UF}`,
                        uf: loc.UF,
                        cn: loc.CN,
                        valorMensal: parseFloat(loc.VALOR_MENSAL || 26.30),
                        valorInstalacao: parseFloat(loc.VALOR_INSTALACAO || 0)
                    });
                }
            });

            locations.push(...uniqueLocations.values());
        }

        return NextResponse.json({
            success: true,
            locations: locations
        });
    } catch (error) {
        console.error('Erro ao buscar localidades:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            locations: []
        }, { status: 500 });
    }
}
