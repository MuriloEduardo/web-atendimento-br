import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-dev-only';

export async function POST(request) {
    try {
        const authHeader = request.headers.get('authorization');
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json(
                { error: 'Token não fornecido' },
                { status: 401 }
            );
        }

        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return NextResponse.json(
                { error: 'Token inválido' },
                { status: 401 }
            );
        }

        const { codigo, numero, areaLocal, cn, valorMensal } = await request.json();

        if (!codigo || !numero || !areaLocal || !cn) {
            return NextResponse.json(
                { error: 'Dados do número incompletos' },
                { status: 400 }
            );
        }

        // Buscar o usuário e sua empresa
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { company: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Usuário não encontrado' },
                { status: 404 }
            );
        }

        if (!user.company) {
            return NextResponse.json(
                { error: 'Empresa não encontrada. Crie uma empresa primeiro.' },
                { status: 400 }
            );
        }

        // Verificar se já existe um número reservado para esta empresa
        const existingReservation = await prisma.reservedNumber.findFirst({
            where: {
                companyId: user.company.id,
                status: 'reserved'
            }
        });

        if (existingReservation) {
            // Atualizar reserva existente
            await prisma.reservedNumber.update({
                where: { id: existingReservation.id },
                data: {
                    codigo,
                    numero,
                    numeroCompleto: `+55 ${cn} ${numero}`,
                    areaLocal,
                    cn,
                    valorMensal: valorMensal || 26.30
                }
            });
        } else {
            // Criar nova reserva
            await prisma.reservedNumber.create({
                data: {
                    codigo,
                    numero,
                    numeroCompleto: `+55 ${cn} ${numero}`,
                    areaLocal,
                    cn,
                    valorMensal: valorMensal || 26.30,
                    companyId: user.company.id,
                    status: 'reserved'
                }
            });
        }

        // Atualizar a empresa com informações básicas do número
        await prisma.company.update({
            where: { id: user.company.id },
            data: {
                whatsappNumber: numero,
                brdidAreaLocal: areaLocal,
                brdidCN: cn,
                whatsappSetup: true
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Número reservado com sucesso',
            number: {
                codigo,
                numero,
                numeroCompleto: `+55 ${cn} ${numero}`,
                status: 'reserved'
            }
        });

    } catch (error) {
        console.error('Erro ao reservar número:', error);
        return NextResponse.json(
            { error: 'Erro ao reservar número' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
