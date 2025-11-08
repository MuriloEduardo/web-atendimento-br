import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({
                success: false,
                error: 'Token não fornecido'
            }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { codigo, areaLocal, cn } = await request.json();

        if (!codigo) {
            return NextResponse.json({
                success: false,
                error: 'Código do número é obrigatório'
            }, { status: 400 });
        }

        // 1. Adquirir o número via BRDID API
        const brdidResponse = await fetch(`${process.env.BRDID_API_URL}/api/did`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                codigo,
                areaLocal,
                cn
            })
        });

        if (!brdidResponse.ok) {
            const errorData = await brdidResponse.json();
            throw new Error(errorData.message || 'Erro ao adquirir número');
        }

        const brdidData = await brdidResponse.json();

        if (!brdidData.success) {
            throw new Error('Falha ao adquirir número no BRDID');
        }

        // 2. Criar Stripe product para o número (se Stripe estiver configurado)
        let stripeProductId = null;
        const stripeEnabled = process.env.STRIPE_SECRET_KEY &&
            process.env.STRIPE_SECRET_KEY !== 'sk_test_dummy';

        if (stripeEnabled) {
            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

            const product = await stripe.products.create({
                name: `Número WhatsApp: ${brdidData.data.numero}`,
                description: `Número de telefone para WhatsApp Business`,
                metadata: {
                    type: 'whatsapp_number',
                    codigo: codigo,
                    cn: cn,
                    areaLocal: areaLocal
                }
            });

            await stripe.prices.create({
                product: product.id,
                unit_amount: Math.round(parseFloat(brdidData.data.valorMensal) * 100), // Centavos
                currency: 'brl',
                recurring: {
                    interval: 'month'
                }
            });

            stripeProductId = product.id;
        }

        // 3. Salvar no banco de dados
        const company = await prisma.company.findFirst({
            where: { userId: decoded.userId }
        });

        if (!company) {
            throw new Error('Empresa não encontrada');
        }

        await prisma.company.update({
            where: { id: company.id },
            data: {
                brdidNumber: brdidData.data.numero,
                brdidNumberId: codigo,
                brdidAreaLocal: areaLocal,
                brdidCN: cn,
                numberPurchaseDate: new Date(),
                stripeProductId: stripeProductId
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                numero: brdidData.data.numero,
                numeroCompleto: `+55 ${cn} ${brdidData.data.numero}`,
                valorMensal: brdidData.data.valorMensal,
                valorInstalacao: brdidData.data.valorInstalacao
            }
        });

    } catch (error) {
        console.error('Erro ao adquirir número:', error);

        // Se der erro, tentar cancelar o número no BRDID
        if (error.brdidAcquired) {
            try {
                await fetch(`${process.env.BRDID_API_URL}/api/did`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ numero: error.numeroAdquirido })
                });
            } catch (cancelError) {
                console.error('Erro ao cancelar número:', cancelError);
            }
        }

        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
