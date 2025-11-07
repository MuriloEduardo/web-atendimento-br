'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardHeader({ user, onboardingStatus, onLogout }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showOnboardingMenu, setShowOnboardingMenu] = useState(false);
  const userMenuRef = useRef(null);
  const onboardingMenuRef = useRef(null);
  const router = useRouter();

  // Fechar menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (onboardingMenuRef.current && !onboardingMenuRef.current.contains(event.target)) {
        setShowOnboardingMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calcular progresso do onboarding
  const getOnboardingProgress = () => {
    if (!onboardingStatus?.steps) return 0;
    const steps = onboardingStatus.steps;
    const completed = [
      steps.company?.completed,
      steps.whatsapp?.completed,
      steps.meta?.completed,
      steps.payment?.completed
    ].filter(Boolean).length;
    return Math.round((completed / 4) * 100);
  };

  const progress = getOnboardingProgress();

  // Status de cada etapa
  const steps = [
    {
      id: 'company',
      name: 'Informações da Empresa',
      path: '/dashboard/onboarding/company',
      completed: onboardingStatus?.steps?.company?.completed,
      icon: '🏢'
    },
    {
      id: 'whatsapp',
      name: 'Número WhatsApp',
      path: '/dashboard/onboarding/whatsapp',
      completed: onboardingStatus?.steps?.whatsapp?.completed,
      icon: '📱',
      warning: onboardingStatus?.steps?.whatsapp?.completed && !onboardingStatus?.steps?.whatsapp?.verified ? 'Aguardando verificação' : null
    },
    {
      id: 'meta',
      name: 'Meta Business',
      path: '/dashboard/onboarding/meta',
      completed: onboardingStatus?.steps?.meta?.completed,
      icon: '🔗',
      warning: onboardingStatus?.steps?.meta?.completed && !onboardingStatus?.steps?.meta?.approved ? 'Aguardando aprovação' : null
    },
    {
      id: 'payment',
      name: 'Assinatura',
      path: '/dashboard/onboarding/payment',
      completed: onboardingStatus?.steps?.payment?.completed,
      icon: '💳'
    }
  ];

  return (
    <header className="bg-white text-black shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <button
              onClick={() => router.push('/dashboard')}
              className="focus:outline-none"
            >
              <h1 className="text-2xl font-bold text-gray-900">Atendimento BR</h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </button>

            {/* Menu de Onboarding */}
            <div className="relative" ref={onboardingMenuRef}>
              <button
                onClick={() => setShowOnboardingMenu(!showOnboardingMenu)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm font-medium">Setup</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">{progress}%</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${showOnboardingMenu ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown do Onboarding */}
              {showOnboardingMenu && (
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900">Configuração Inicial</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Complete todas as etapas para começar a usar
                    </p>
                  </div>
                  
                  <div className="py-2">
                    {steps.map((step) => (
                      <button
                        key={step.id}
                        onClick={() => {
                          router.push(step.path);
                          setShowOnboardingMenu(false);
                        }}
                        className="w-full px-4 py-3 hover:bg-gray-50 flex items-start space-x-3 transition-colors"
                      >
                        <span className="text-2xl">{step.icon}</span>
                        <div className="flex-1 text-left">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">
                              {step.name}
                            </span>
                            {step.completed ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                ✓ Concluído
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                Pendente
                              </span>
                            )}
                          </div>
                          {step.warning && (
                            <p className="text-xs text-orange-600 mt-1 flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              {step.warning}
                            </p>
                          )}
                        </div>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>

                  <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">
                        {steps.filter(s => s.completed).length} de {steps.length} etapas concluídas
                      </span>
                      {progress === 100 && (
                        <span className="text-green-600 font-medium">
                          🎉 Tudo pronto!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Menu do Usuário */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || 'Usuário'}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.email}
                </p>
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown do Usuário */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                
                <div className="py-2">
                  <button
                    onClick={() => {
                      router.push('/dashboard/profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Meu Perfil</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push('/dashboard/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Configurações</span>
                  </button>

                  <button
                    onClick={() => {
                      router.push('/dashboard/subscription');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span>Assinatura</span>
                  </button>
                </div>

                <div className="border-t border-gray-200 py-2">
                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
