'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 97,
    period: 'mês',
    description: 'Ideal para começar',
    features: [
      'Até 1.000 mensagens/mês',
      'Respostas automáticas',
      'Chatbot básico',
      'Suporte por email',
      'Relatórios básicos'
    ],
    highlighted: false
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 197,
    period: 'mês',
    description: 'Perfeito para empresas em crescimento',
    features: [
      'Até 5.000 mensagens/mês',
      'Chatbot avançado',
      'Integração com CRM',
      'Suporte prioritário',
      'Relatórios avançados',
      'Múltiplos números',
      'API personalizada'
    ],
    highlighted: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 397,
    period: 'mês',
    description: 'Solução completa para grandes empresas',
    features: [
      'Mensagens ilimitadas',
      'Chatbot com IA',
      'Integração completa',
      'Suporte 24/7',
      'Dashboard personalizado',
      'Múltiplas equipes',
      'White label'
    ],
    highlighted: false
  }
];

export default function SubscriptionPlans() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectPlan = async (planId) => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planId,
          trial: false
        })
      });

      const data = await response.json();

      if (response.ok && data.url) {
        // Redirecionar para checkout do Stripe
        window.location.assign(data.url);
      } else {
        setError(data.error || 'Erro ao criar sessão de pagamento');
        setIsLoading(false);
      }
    } catch (error) {
      setError('Erro ao processar. Tente novamente.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            💳 Escolha Seu Plano
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Selecione o plano ideal para o seu negócio
          </p>
          <p className="text-gray-500">
            Cancele quando quiser • Sem taxas ocultas • Suporte em português
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-md mx-auto mb-12">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-600">Etapa 4 de 4</span>
            <span className="text-sm text-gray-500">100% ao finalizar</span>
          </div>
          <div className="w-full bg-white rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        {error && (
          <div className="max-w-2xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 ${
                plan.highlighted ? 'ring-4 ring-blue-500' : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                  Mais Popular
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-end justify-center">
                    <span className="text-5xl font-bold text-gray-900">
                      R$ {plan.price}
                    </span>
                    <span className="text-gray-600 ml-2 mb-2">
                      /{plan.period}
                    </span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isLoading}
                  className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
                    plan.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:bg-gray-50'
                  }`}
                >
                  {isLoading ? 'Processando...' : 'Escolher Plano'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            Todos os planos incluem:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <span className="text-green-500 mr-3">✓</span>
              <span className="text-gray-700">Configuração assistida</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-3">✓</span>
              <span className="text-gray-700">Atualizações gratuitas</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-3">✓</span>
              <span className="text-gray-700">Segurança de dados</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-3">✓</span>
              <span className="text-gray-700">Documentação completa</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-3">✓</span>
              <span className="text-gray-700">Sem taxa de setup</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-3">✓</span>
              <span className="text-gray-700">Cancelamento a qualquer momento</span>
            </div>
          </div>
        </div>

        {/* Back to Dashboard */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Voltar ao Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
