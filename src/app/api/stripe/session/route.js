import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-dev-only';

// Inicializar Stripe
const getStripeInstance = async () => {
    const Stripe = (await import('stripe')).default;
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
    });
};

export async function GET(request) {
    try {
        // Verificar autenticação
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
        }

        try {
            jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
        }

        // Obter session_id da URL
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json({ error: 'Session ID não fornecido' }, { status: 400 });
        }

        // Buscar sessão no Stripe
        const stripe = await getStripeInstance();
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        return NextResponse.json({
            payment_status: session.payment_status,
            customer_email: session.customer_email,
            amount_total: session.amount_total,
            currency: session.currency,
            metadata: session.metadata
        });

    } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        return NextResponse.json({
            error: 'Erro ao verificar sessão',
            details: error.message
        }, { status: 500 });
    }
}
