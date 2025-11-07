import { NextResponse } from 'next/server';
import { extractAuthToken, createAuthErrorResponse } from '@/lib/authMiddleware';
import prisma from '@/lib/prisma';

export async function GET(request) {
    try {
        const { user: tokenUser, error } = extractAuthToken(request);

        if (error) {
            return createAuthErrorResponse(error);
        }

        if (!tokenUser || !tokenUser.userId) {
            return createAuthErrorResponse('Token inválido');
        }

        // Buscar settings do usuário
        let settings = await prisma.userSettings.findUnique({
            where: { userId: tokenUser.userId }
        });

        // Se não existir, criar com valores padrão
        if (!settings) {
            settings = await prisma.userSettings.create({
                data: {
                    userId: tokenUser.userId,
                    emailNotifications: true,
                    pushNotifications: false,
                    newMessageNotifications: true,
                    weeklyReports: true,
                    language: 'pt-BR',
                    timezone: 'America/Sao_Paulo',
                    dateFormat: 'DD/MM/YYYY',
                    darkMode: false
                }
            });
        }

        return NextResponse.json(settings);

    } catch (error) {
        console.error('Erro ao buscar settings:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    try {
        const { user: tokenUser, error } = extractAuthToken(request);

        if (error) {
            return createAuthErrorResponse(error);
        }

        if (!tokenUser || !tokenUser.userId) {
            return createAuthErrorResponse('Token inválido');
        }

        const data = await request.json();

        // Atualizar settings
        const settings = await prisma.userSettings.upsert({
            where: { userId: tokenUser.userId },
            update: data,
            create: {
                userId: tokenUser.userId,
                ...data
            }
        });

        return NextResponse.json(settings);

    } catch (error) {
        console.error('Erro ao atualizar settings:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
