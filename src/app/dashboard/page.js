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

          {/* Status da Assinatura - Apenas se tiver assinatura ativa */}
          {subscription?.hasSubscription && subscription.subscription.status === 'active' && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-lg mb-6 overflow-hidden">
              <div className="px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 bg-green-500 rounded-full p-3">
                      <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Plano {subscription.subscription.planName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        R$ {(subscription.subscription.price / 100).toFixed(2)}/mês •
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Ativo
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/dashboard/subscription')}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Gerenciar
                  </button>
                </div>

                <div className="mt-4 pt-4 border-t border-green-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {subscription.subscription?.features?.slice(0, 4).map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-700">
                        <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="truncate">{getFeatureName(feature)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aviso de Pagamento Pendente */}
          {subscription?.hasSubscription && subscription.subscription.status === 'trialing' && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl shadow-lg mb-6 overflow-hidden">
              <div className="px-6 py-5">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-full p-3">
                    <svg className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-yellow-900">
                      Pagamento Pendente
                    </h3>
                    <p className="mt-1 text-sm text-yellow-800">
                      Complete o pagamento para ativar sua assinatura e liberar todas as funcionalidades.
                    </p>
                    <button
                      onClick={() => router.push(`/payment/${subscription.subscription.planId || ''}`)}
                      className="mt-4 inline-flex items-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Concluir Pagamento Agora
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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

          {/* Guia de Início Rápido - Após completar onboarding */}
          {onboardingStatus?.allComplete && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Próximos Passos */}
              <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Próximos Passos
                  </h3>
                  <p className="text-blue-100 text-sm mt-1">Configure seu primeiro chatbot</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        1
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900">Criar Primeiro Chatbot</h4>
                      <p className="text-xs text-gray-600 mt-1">Configure respostas automáticas para perguntas frequentes</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        2
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900">Importar Contatos</h4>
                      <p className="text-xs text-gray-600 mt-1">Adicione sua base de clientes para começar a enviar mensagens</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        3
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900">Configurar Equipe</h4>
                      <p className="text-xs text-gray-600 mt-1">Convide membros da equipe para colaborar nos atendimentos</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recursos Disponíveis */}
              <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Recursos Disponíveis
                  </h3>
                  <p className="text-green-100 text-sm mt-1">Explore as funcionalidades da plataforma</p>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🤖</span>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Chatbot com IA</h4>
                        <p className="text-xs text-gray-600">Respostas inteligentes automáticas</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">📊</span>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Relatórios Avançados</h4>
                        <p className="text-xs text-gray-600">Métricas e análises em tempo real</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🔗</span>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Integrações</h4>
                        <p className="text-xs text-gray-600">Conecte com CRM e outras ferramentas</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">👥</span>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">Multi-usuários</h4>
                        <p className="text-xs text-gray-600">Colaboração em equipe</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ajuda e Suporte */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-sm border-2 border-purple-200 overflow-hidden">
            <div className="px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 bg-purple-500 rounded-full p-3">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Precisa de Ajuda?</h3>
                    <p className="text-sm text-gray-600">Nossa equipe está pronta para te ajudar</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button className="px-4 py-2 bg-white border-2 border-purple-300 rounded-lg text-sm font-medium text-purple-700 hover:bg-purple-50 transition-colors">
                    📚 Central de Ajuda
                  </button>
                  <button className="px-4 py-2 bg-purple-500 rounded-lg text-sm font-medium text-white hover:bg-purple-600 transition-colors">
                    💬 Falar com Suporte
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}