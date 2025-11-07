import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const areaLocal = searchParams.get('areaLocal');
        const limit = searchParams.get('limit') || '50';

        if (!areaLocal) {
            return NextResponse.json({
                success: false,
                error: 'Parâmetro areaLocal é obrigatório'
            }, { status: 400 });
        }

        const response = await fetch(
            `http://localhost:7000/api/did/numeros?areaLocal=${areaLocal}&limit=${limit}`
        );

        if (!response.ok) {
            throw new Error('Erro ao buscar números disponíveis');
        }

        const data = await response.json();

        // Formatar os números para exibição no formato esperado pelo frontend
        const numbers = data.success && Array.isArray(data.data)
            ? data.data.map(num => ({
                id: num.CODIGO,
                codigo: num.CODIGO,
                numero: num.NUMERO,
                numeroCompleto: `+55 ${num.CN} ${num.NUMERO}`,
                cn: num.CN,
                valorMensal: parseFloat(num.VALOR_MENSAL || 26.30),
                valorInstalacao: parseFloat(num.VALOR_INSTALACAO || 0),
                gold: num.GOLD === '1',
                superGold: num.SUPER_GOLD === '1',
                diamante: num.DIAMANTE === '1'
            }))
            : [];

        return NextResponse.json({
            success: true,
            numbers: numbers
        });
    } catch (error) {
        console.error('Erro ao buscar números:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
