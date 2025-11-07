'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';

export default function SubscriptionPage() {
    const [user, setUser] = useState(null);
    const [onboardingStatus, setOnboardingStatus] = useState(null);
    const [subscription, setSubscription] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const loadData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const [userRes, statusRes, subRes] = await Promise.all([
                fetch('/api/user/profile', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/user/onboarding-status', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/subscription/status', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            setUser(await userRes.json());
            setOnboardingStatus(await statusRes.json());
            setSubscription(await subRes.json());
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

    const plans = [
        {
            id: 'starter',
            name: 'Starter',
            price: 9700,
            description: 'Perfeito para começar',
            features: ['1.000 mensagens/mês', 'Respostas automáticas', 'Chatbot básico', 'Suporte por email', 'Relatórios básicos']
        },
        {
            id: 'professional',
            name: 'Professional',
            price: 19700,
            description: 'Para empresas em crescimento',
            popular: true,
            features: ['5.000 mensagens/mês', 'Chatbot avançado com IA', 'Integração com CRM', 'Suporte prioritário', 'Relatórios avançados', 'Múltiplos números']
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: 39700,
            description: 'Solução completa',
            features: ['Mensagens ilimitadas', 'IA personalizada', 'Integração completa', 'Suporte 24/7', 'Dashboard personalizado', 'API personalizada', 'White label']
        }
    ];

    const currentPlan = subscription?.hasSubscription
        ? plans.find(p => p.id === subscription.subscription.planId)
        : null;

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader
                user={user}
                onboardingStatus={onboardingStatus}
                onLogout={() => { localStorage.removeItem('token'); router.push('/login'); }}
            />

            <main className="max-w-7xl mx-auto py-8 px-4">
                {/* Breadcrumb */}
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

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Minha Assinatura</h1>
                    <p className="text-gray-600">Gerencie seu plano e forma de pagamento</p>
                </div>

                {/* Plano Atual */}
                {subscription?.hasSubscription && currentPlan && (
                    <div className="mb-8 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-8 text-white">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h2 className="text-2xl font-bold">Plano {currentPlan.name}</h2>
                                        <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                                            {subscription.subscription.status === 'active' ? 'Ativo' : 'Pendente'}
                                        </span>
                                    </div>
                                    <p className="text-green-100">{currentPlan.description}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold">R$ {(currentPlan.price / 100).toFixed(2)}</p>
                                    <p className="text-green-100 text-sm">por mês</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                                {currentPlan.features.map((feature, index) => (
                                    <div key={index} className="flex items-center space-x-2 text-sm">
                                        <svg className="w-5 h-5 text-green-200" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => router.push('/dashboard/subscription/change')}
                                    className="px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
                                >
                                    Alterar Plano
                                </button>
                                <button className="px-6 py-3 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors font-medium">
                                    Cancelar Assinatura
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sem Assinatura - Mostrar Planos */}
                {!subscription?.hasSubscription && (
                    <div className="mb-8">
                        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-8">
                            <div className="flex items-start space-x-3">
                                <svg className="w-6 h-6 text-yellow-600 mt-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <h3 className="text-lg font-semibold text-yellow-900">Você não possui uma assinatura ativa</h3>
                                    <p className="text-yellow-800 mt-1">Escolha um plano abaixo para começar a usar todos os recursos da plataforma</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {plans.map((plan) => (
                                <div
                                    key={plan.id}
                                    className={`relative bg-white rounded-2xl shadow-lg border-2 ${plan.popular ? 'border-green-500 shadow-2xl scale-105' : 'border-gray-200'
                                        } overflow-hidden transition-transform hover:scale-105`}
                                >
                                    {plan.popular && (
                                        <div className="absolute top-0 left-0 right-0 bg-green-500 text-white text-center py-2 text-sm font-semibold">
                                            ⭐ Mais Popular
                                        </div>
                                    )}
                                    <div className={`p-8 ${plan.popular ? 'pt-14' : ''}`}>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                        <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                                        <div className="mb-6">
                                            <span className="text-4xl font-bold text-gray-900">R$ {(plan.price / 100).toFixed(2)}</span>
                                            <span className="text-gray-600 text-sm">/mês</span>
                                        </div>

                                        <ul className="space-y-3 mb-8">
                                            {plan.features.map((feature, index) => (
                                                <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                                                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            onClick={() => router.push(`/payment/${plan.id}`)}
                                            className={`w-full py-3 rounded-lg font-semibold transition-colors ${plan.popular
                                                ? 'bg-green-600 text-white hover:bg-green-700'
                                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                                }`}
                                        >
                                            Escolher {plan.name}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Histórico de Pagamentos */}
                {subscription?.hasSubscription && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Histórico de Pagamentos</h2>
                        </div>
                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead>
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nota Fiscal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <tr>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date().toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                Plano {currentPlan?.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                R$ {(currentPlan?.price / 100).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Pago
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button className="text-green-600 hover:text-green-700 font-medium">
                                                    Baixar
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Informações Adicionais */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="bg-blue-500 rounded-full p-2">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900">Pagamento Seguro</h3>
                        </div>
                        <p className="text-sm text-gray-700">
                            Seus pagamentos são processados com segurança via Stripe
                        </p>
                    </div>

                    <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="bg-green-500 rounded-full p-2">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900">Cancele Quando Quiser</h3>
                        </div>
                        <p className="text-sm text-gray-700">
                            Sem taxas de cancelamento. Cancele sua assinatura a qualquer momento
                        </p>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="bg-purple-500 rounded-full p-2">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-gray-900">Suporte Dedicado</h3>
                        </div>
                        <p className="text-sm text-gray-700">
                            Nossa equipe está pronta para ajudar você a qualquer momento
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
