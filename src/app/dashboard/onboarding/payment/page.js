'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';

export default function PaymentOnboardingPage() {
    const [user, setUser] = useState(null);
    const [onboardingStatus, setOnboardingStatus] = useState(null);
    const [paymentData, setPaymentData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const loadData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const [userRes, statusRes] = await Promise.all([
                fetch('/api/user/profile', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/user/onboarding-status', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            setUser(await userRes.json());
            const statusData = await statusRes.json();
            setOnboardingStatus(statusData);
            setPaymentData(statusData.steps?.payment);
        } catch (error) {
            console.error('Erro:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    const getPlanName = (planId) => {
        const plans = {
            starter: 'Plano Starter',
            professional: 'Plano Professional',
            enterprise: 'Plano Enterprise'
        };
        return plans[planId] || planId;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader
                user={user}
                onboardingStatus={onboardingStatus}
                onLogout={() => { localStorage.removeItem('token'); router.push('/login'); }}
            />

            <main className="max-w-4xl mx-auto py-8 px-4">
                <nav className="flex mb-8">
                    <ol className="inline-flex items-center space-x-1">
                        <li>
                            <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-700 hover:text-green-600">
                                Dashboard
                            </button>
                        </li>
                        <li className="flex items-center">
                            <svg className="w-3 h-3 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm text-gray-500">Assinatura</span>
                        </li>
                    </ol>
                </nav>

                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-2">
                        <span className="text-4xl">💳</span>
                        <h1 className="text-3xl font-bold text-gray-900">Assinatura</h1>
                    </div>
                    <p className="text-gray-600">Gerencie sua assinatura e forma de pagamento</p>
                </div>

                <div className={`mb-6 p-4 rounded-lg border-2 ${paymentData?.completed ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                    }`}>
                    <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${paymentData?.completed ? 'bg-green-500' : 'bg-yellow-500'
                            }`}>
                            {paymentData?.completed ? '✓' : '⏱'}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">
                                {paymentData?.completed ? 'Assinatura Ativa' : 'Assinatura Pendente'}
                            </h3>
                            <p className="text-sm text-gray-700">
                                {paymentData?.completed
                                    ? 'Sua assinatura está ativa e funcionando'
                                    : 'Complete o pagamento para ativar sua conta'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                    {paymentData?.completed ? (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-4 text-gray-900">Detalhes da Assinatura</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Plano Atual</label>
                                        <p className="mt-1 text-gray-900 font-medium">{getPlanName(paymentData.planId)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500">Status</label>
                                        <div className="mt-1">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                {paymentData.status === 'active' ? 'Ativo' : paymentData.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-start space-x-2">
                                    <span className="text-green-600">✓</span>
                                    <div>
                                        <h3 className="text-sm font-medium text-green-900">Tudo Pronto!</h3>
                                        <p className="mt-1 text-sm text-green-700">
                                            Sua conta está totalmente configurada. Você pode começar a usar todos os recursos agora.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-3 pt-4 border-t">
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                                >
                                    Ir para Dashboard
                                </button>
                                <button
                                    onClick={() => router.push('/dashboard/subscription')}
                                    className="px-6 py-2 border rounded-md hover:bg-gray-50"
                                >
                                    Gerenciar Assinatura
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">💳</span>
                                </div>
                                <h3 className="text-lg font-medium mb-2 text-gray-900">Ative Sua Assinatura</h3>
                                <p className="text-gray-600 mb-6">
                                    Escolha um plano para começar a usar o Atendimento BR
                                </p>
                            </div>

                            {/* Planos Disponíveis */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { id: 'starter', name: 'Starter', price: 'R$ 99', features: ['1.000 mensagens', 'Suporte básico'] },
                                    { id: 'professional', name: 'Professional', price: 'R$ 299', features: ['5.000 mensagens', 'Suporte prioritário'], popular: true },
                                    { id: 'enterprise', name: 'Enterprise', price: 'R$ 599', features: ['Ilimitado', 'Suporte 24/7'] }
                                ].map((plan) => (
                                    <div
                                        key={plan.id}
                                        className={`relative border-2 rounded-lg p-4 ${plan.popular ? 'border-green-500 shadow-lg' : 'border-gray-200'
                                            }`}
                                    >
                                        {plan.popular && (
                                            <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                                                Mais Popular
                                            </span>
                                        )}
                                        <h3 className="text-lg font-semibold text-center text-gray-900">{plan.name}</h3>
                                        <p className="text-2xl font-bold text-center my-3 text-gray-900">{plan.price}<span className="text-sm text-gray-500">/mês</span></p>
                                        <ul className="space-y-2 mb-4">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="text-sm text-gray-600 flex items-center">
                                                    <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                        <button
                                            onClick={() => router.push(`/payment/${plan.id}`)}
                                            className={`w-full py-2 px-4 rounded-md font-medium ${plan.popular
                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                : 'border border-gray-300 hover:bg-gray-50'
                                                }`}
                                        >
                                            Escolher Plano
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                                <div className="flex items-start space-x-2">
                                    <span className="text-blue-600">ℹ️</span>
                                    <div>
                                        <h3 className="text-sm font-medium text-blue-900">Teste Grátis de 7 Dias</h3>
                                        <p className="mt-1 text-sm text-blue-700">
                                            Todos os planos incluem 7 dias de teste gratuito. Cancele a qualquer momento.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {paymentData?.completed && (
                    <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 Parabéns!</h2>
                            <p className="text-gray-700 mb-4">
                                Você completou todas as etapas de configuração. Sua conta está pronta para uso!
                            </p>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-lg"
                            >
                                Começar a Usar
                                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
