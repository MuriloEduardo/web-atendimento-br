'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingSteps({ user, onboardingStatus, onRefresh }) {
  const router = useRouter();
  const [expandedStep, setExpandedStep] = useState(null);

  // Se não há dados de onboarding ainda, não mostrar
  if (!onboardingStatus) {
    return null;
  }

  const { steps: stepStatus, allComplete } = onboardingStatus;

  // Definir os 4 steps do onboarding com dados reais
  const steps = [
    {
      id: 'company',
      title: '1. Criar Empresa',
      description: 'Configure as informações da sua empresa',
      completed: stepStatus.company.completed,
      icon: '🏢',
      action: () => router.push('/dashboard/company/create')
    },
    {
      id: 'number',
      title: '2. Número do WhatsApp',
      description: 'Escolha ou compre um número para seu atendimento',
      completed: stepStatus.whatsapp.completed,
      icon: '📱',
      requiresPrevious: true,
      action: () => router.push('/dashboard/whatsapp/setup')
    },
    {
      id: 'meta',
      title: '3. Meta Business API',
      description: 'Configure sua conta do WhatsApp Business',
      completed: stepStatus.meta.completed,
      icon: '🔗',
      requiresPrevious: true,
      action: () => router.push('/dashboard/meta/setup')
    },
    {
      id: 'payment',
      title: '4. Ativar Assinatura',
      description: 'Escolha seu plano e realize o pagamento',
      completed: stepStatus.payment.completed,
      icon: '💳',
      requiresPrevious: true,
      action: () => router.push('/dashboard/subscription/plans')
    }
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercentage = (completedCount / steps.length) * 100;

  // Se tudo está completo, não mostrar nada
  if (allComplete) {
    return null;
  }

  const isStepLocked = (step, index) => {
    if (!step.requiresPrevious) return false;
    // Verificar se o step anterior está completo
    return index > 0 && !steps[index - 1].completed;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="mr-3">🚀</span>
            Complete a Configuração da Sua Conta
          </h2>
          <p className="text-gray-600 mt-1">
            {allComplete 
              ? '✅ Tudo pronto! Sua conta está ativa.' 
              : `Complete ${4 - completedCount} ${4 - completedCount === 1 ? 'etapa' : 'etapas'} para ativar sua conta`
            }
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600">
            {completedCount}/4
          </div>
          <div className="text-sm text-gray-500">concluídas</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progresso</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step, index) => {
          const isLocked = isStepLocked(step, index);
          const isExpanded = expandedStep === step.id;

          return (
            <div
              key={step.id}
              className={`relative border-2 rounded-xl p-4 transition-all ${
                step.completed
                  ? 'bg-green-50 border-green-300 shadow-md'
                  : isLocked
                  ? 'bg-gray-100 border-gray-300 opacity-60'
                  : 'bg-white border-blue-300 hover:border-blue-400 hover:shadow-md'
              }`}
            >
              {/* Status Badge */}
              {step.completed && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg">
                  ✓
                </div>
              )}
              {isLocked && (
                <div className="absolute -top-2 -right-2 bg-gray-400 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg">
                  🔒
                </div>
              )}

              {/* Content */}
              <div className="flex items-start">
                <div className="text-4xl mr-4">{step.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {step.description}
                  </p>

                  {/* Action Button */}
                  {!step.completed && !isLocked && (
                    <button
                      onClick={step.action}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all font-medium text-sm shadow-md hover:shadow-lg"
                    >
                      Iniciar →
                    </button>
                  )}

                  {step.completed && (
                    <div className="text-green-600 font-medium text-sm flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Concluído
                    </div>
                  )}

                  {isLocked && (
                    <div className="text-gray-500 text-sm italic">
                      Complete a etapa anterior primeiro
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Warning if not complete */}
      {!allComplete && (
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">`
              <p className="text-sm text-yellow-700">
                <strong>Atenção:</strong> Sua conta ficará limitada até que todas as etapas sejam concluídas e o pagamento confirmado.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
