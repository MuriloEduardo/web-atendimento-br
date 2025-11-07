'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingSteps from './OnboardingSteps';
import DashboardHeader from '@/components/DashboardHeader';

// Função para converter códigos de features em nomes legíveis
const getFeatureName = (featureCode) => {
  const featureNames = {
    '1000_messages': 'Até 1.000 mensagens/mês',
    '5000_messages': 'Até 5.000 mensagens/mês',
    'unlimited_messages': 'Mensagens ilimitadas',
    'auto_responses': 'Respostas automáticas',
    'basic_chatbot': 'Chatbot básico',
    'advanced_chatbot': 'Chatbot avançado',
    'ai_chatbot': 'Chatbot com IA',
    'crm_integration': 'Integração com CRM',
    'full_integration': 'Integração completa',
    'email_support': 'Suporte por email',
    'priority_support': 'Suporte prioritário',
    '24_7_support': 'Suporte 24/7',
    'basic_reports': 'Relatórios básicos',
    'advanced_reports': 'Relatórios avançados',
    'custom_dashboard': 'Dashboard personalizado',
    'multiple_numbers': 'Múltiplos números',
    'multiple_teams': 'Múltiplas equipes',
    'custom_api': 'API personalizada',
    'white_label': 'White label'
  };

  return featureNames[featureCode] || featureCode;
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      console.log('🔄 Carregando dados do usuário e status do onboarding...');

      // Carregar dados do usuário
      const userResponse = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();

        // userData agora contém: { user, message }
        const userProfile = userData.user || userData;

        // Não redirecionar mais - mostrar onboarding dentro do dashboard
        setUser(userProfile);
      } else {
        // Token inválido
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      // Carregar status do onboarding
      try {
        const onboardingResponse = await fetch('/api/user/onboarding-status', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (onboardingResponse.ok) {
          const onboardingData = await onboardingResponse.json();
          setOnboardingStatus(onboardingData);
        }
      } catch (error) {
        console.error('Erro ao carregar status do onboarding:', error);
      }

      // Carregar dados da assinatura
      try {
        const subscriptionResponse = await fetch('/api/subscription/status', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (subscriptionResponse.ok) {
          const subscriptionData = await subscriptionResponse.json();
          setSubscription(subscriptionData);
        }
      } catch (error) {
        console.error('Erro ao carregar assinatura:', error);
      }

    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Detectar parâmetro refresh e recarregar dados
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('refresh') === 'true') {
        console.log('🔄 Refresh detectado - recarregando dados do onboarding...');
        // Limpar o parâmetro da URL
        window.history.replaceState({}, '', '/dashboard');
        // Forçar recarga dos dados após um pequeno delay para garantir que o banco foi atualizado
        setTimeout(() => {
          loadUser();
        }, 500);
      }
    }
  }, [loadUser]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Novo Header com Dropdowns */}
      <DashboardHeader 
        user={user}
        onboardingStatus={onboardingStatus}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Onboarding Steps - Mostra se não estiver completo */}
          <OnboardingSteps
            user={user}
            onboardingStatus={onboardingStatus}
            onRefresh={() => loadUser()}
          />

          {/* Welcome message */}
          <div className="bg-white text-black overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium mb-2">
                Bem-vindo ao seu dashboard!
              </h2>
              <p className="text-gray-600">
                Esta é a página principal da sua conta no Atendimento BR.
                Aqui você poderá gerenciar seus atendimentos, configurações e muito mais.
              </p>
            </div>
          </div>

          {/* Subscription Status */}
          {subscription && (
            <div className="bg-white text-black overflow-hidden shadow rounded-lg mb-6">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium mb-4">
                  Status da Assinatura
                </h3>

                {subscription.hasSubscription ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">
                          Plano {subscription.subscription.planName}
                        </h4>
                        <p className="text-sm">
                          R$ {(subscription.subscription.price / 100).toFixed(2)}/mês
                        </p>
                      </div>
                      <div className="text-right">
                        {subscription.subscription.status === 'trialing' ? (
                          <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pagamento pendente
                            </span>
                            <p className="text-sm mt-1">
                              Conclua o pagamento para liberar todas as funcionalidades.
                            </p>
                          </div>
                        ) : subscription.subscription.status === 'active' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Ativo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Vencido
                          </span>
                        )}
                      </div>
                    </div>

                    {subscription.subscription.status === 'trialing' && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                              Finalize o pagamento para ativar sua assinatura
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <p>
                                Sem a confirmação do pagamento, o acesso ao dashboard ficará indisponível.
                              </p>
                            </div>
                            <div className="mt-3">
                              <button
                                onClick={() => router.push(`/payment/${subscription.subscription.planId || ''}`)}
                                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded text-sm font-medium"
                              >
                                Concluir pagamento agora
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <h5 className="text-sm font-medium mb-2">Funcionalidades incluídas:</h5>
                      <ul className="text-sm space-y-1">
                        {subscription.subscription.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {getFeatureName(feature)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">Você não possui uma assinatura ativa.</p>
                    <button
                      onClick={() => router.push('/dashboard/subscription/plans')}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      style={{ backgroundColor: '#25d366' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#1da651'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#25d366'}
                    >
                      Escolher Plano
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            <div className="bg-white text-black overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Atendimentos hoje
                      </dt>
                      <dd className="text-lg font-medium">
                        0
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white text-black overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Satisfação média
                      </dt>
                      <dd className="text-lg font-medium">
                        --
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white text-black overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Tempo médio de resposta
                      </dt>
                      <dd className="text-lg font-medium">
                        --
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insights e Dicas de Onboarding */}
          {onboardingStatus && !onboardingStatus.allComplete && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Dicas de Configuração */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-5">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 bg-blue-500 rounded-lg p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="ml-4 text-lg font-bold text-gray-900">
                      💡 Dica Rápida
                    </h3>
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-3">
                    {!onboardingStatus.steps.company.completed && (
                      <>
                        <strong>Passo 1:</strong> Configure os dados da sua empresa para personalizar a experiência de atendimento.
                      </>
                    )}
                    {onboardingStatus.steps.company.completed && !onboardingStatus.steps.whatsapp.completed && (
                      <>
                        <strong>Próximo passo:</strong> Escolha seu número do WhatsApp! Temos números premium disponíveis em várias regiões do Brasil.
                      </>
                    )}
                    {onboardingStatus.steps.whatsapp.completed && !onboardingStatus.steps.meta.completed && (
                      <>
                        <strong>Quase lá!</strong> Conecte sua conta Meta Business para integrar com o WhatsApp oficial.
                      </>
                    )}
                    {onboardingStatus.steps.meta.completed && !onboardingStatus.steps.payment.completed && (
                      <>
                        <strong>Último passo!</strong> Ative sua assinatura para desbloquear todos os recursos de automação.
                      </>
                    )}
                  </p>
                  <div className="bg-white bg-opacity-60 rounded-lg p-3 text-xs text-gray-600">
                    <strong>Tempo estimado:</strong> 5-10 minutos para completar a configuração
                  </div>
                </div>
              </div>

              {/* Estatísticas de Progresso */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-5">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 bg-green-500 rounded-lg p-3">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="ml-4 text-lg font-bold text-gray-900">
                      🚀 Seu Progresso
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Configuração inicial</span>
                      <span className="text-2xl font-bold text-green-600">
                        {Math.round((
                          (onboardingStatus.steps.company.completed ? 25 : 0) +
                          (onboardingStatus.steps.whatsapp.completed ? 25 : 0) +
                          (onboardingStatus.steps.meta.completed ? 25 : 0) +
                          (onboardingStatus.steps.payment.completed ? 25 : 0)
                        ))}%
                      </span>
                    </div>
                    <div className="bg-white rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.round((
                            (onboardingStatus.steps.company.completed ? 25 : 0) +
                            (onboardingStatus.steps.whatsapp.completed ? 25 : 0) +
                            (onboardingStatus.steps.meta.completed ? 25 : 0) +
                            (onboardingStatus.steps.payment.completed ? 25 : 0)
                          ))}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-3">
                      {onboardingStatus.steps.company.completed &&
                        onboardingStatus.steps.whatsapp.completed &&
                        onboardingStatus.steps.meta.completed &&
                        onboardingStatus.steps.payment.completed ? (
                        <span className="text-green-600 font-semibold">
                          ✅ Configuração completa! Pronto para começar.
                        </span>
                      ) : (
                        <>
                          Faltam apenas{' '}
                          <strong>
                            {4 - [
                              onboardingStatus.steps.company.completed,
                              onboardingStatus.steps.whatsapp.completed,
                              onboardingStatus.steps.meta.completed,
                              onboardingStatus.steps.payment.completed
                            ].filter(Boolean).length}
                          </strong>
                          {' '}etapa(s) para começar a atender!
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Benefícios e Features */}
          {onboardingStatus && onboardingStatus.allComplete && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Economia de Tempo */}
              <div className="bg-white border-2 border-purple-200 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="px-6 py-5">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-purple-100 rounded-full p-4">
                      <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-center text-lg font-bold text-gray-900 mb-2">
                    ⚡ Tempo Economizado
                  </h3>
                  <p className="text-center text-3xl font-bold text-purple-600 mb-2">
                    ~15h/semana
                  </p>
                  <p className="text-center text-sm text-gray-600">
                    Com automação de respostas, você foca no que importa: crescer seu negócio
                  </p>
                </div>
              </div>

              {/* Taxa de Resposta */}
              <div className="bg-white border-2 border-blue-200 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="px-6 py-5">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-blue-100 rounded-full p-4">
                      <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-center text-lg font-bold text-gray-900 mb-2">
                    📈 Resposta Instantânea
                  </h3>
                  <p className="text-center text-3xl font-bold text-blue-600 mb-2">
                    &lt;5 segundos
                  </p>
                  <p className="text-center text-sm text-gray-600">
                    Seus clientes recebem respostas imediatas 24/7, mesmo fora do horário comercial
                  </p>
                </div>
              </div>

              {/* Satisfação do Cliente */}
              <div className="bg-white border-2 border-green-200 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="px-6 py-5">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-green-100 rounded-full p-4">
                      <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-center text-lg font-bold text-gray-900 mb-2">
                    😊 Satisfação
                  </h3>
                  <p className="text-center text-3xl font-bold text-green-600 mb-2">
                    +40%
                  </p>
                  <p className="text-center text-sm text-gray-600">
                    Clientes mais satisfeitos com atendimento rápido e eficiente
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recent activity */}
          <div className="bg-white text-black shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium mb-4">
                Atividade recente
              </h3>
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium">Nenhuma atividade ainda</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Suas atividades de atendimento aparecerão aqui.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}