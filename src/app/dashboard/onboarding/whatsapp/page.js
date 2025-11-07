'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';

export default function WhatsAppOnboardingPage() {
  const [user, setUser] = useState(null);
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [whatsappData, setWhatsappData] = useState(null);
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
        fetch('/api/user/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/user/onboarding-status', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const userData = await userRes.json();
      const statusData = await statusRes.json();
      
      setUser(userData);
      setOnboardingStatus(statusData);
      setWhatsappData(statusData.steps?.whatsapp);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const isVerificationPending = whatsappData?.completed && whatsappData?.number && !whatsappData?.verified;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        user={user}
        onboardingStatus={onboardingStatus}
        onLogout={handleLogout}
      />

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-green-600"
              >
                Dashboard
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500">Número WhatsApp</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header da Página */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-4xl">📱</span>
            <h1 className="text-3xl font-bold text-gray-900">Número WhatsApp</h1>
          </div>
          <p className="text-gray-600">
            Configure seu número WhatsApp Business para começar a atender
          </p>
        </div>

        {/* Status Card */}
        <div className={`mb-6 p-4 rounded-lg border-2 ${
          whatsappData?.completed 
            ? isVerificationPending
              ? 'bg-orange-50 border-orange-200'
              : 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                whatsappData?.completed 
                  ? isVerificationPending 
                    ? 'bg-orange-500' 
                    : 'bg-green-500'
                  : 'bg-yellow-500'
              }`}>
                {whatsappData?.completed ? (
                  isVerificationPending ? (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className={`font-semibold ${
                  whatsappData?.completed 
                    ? isVerificationPending 
                      ? 'text-orange-900' 
                      : 'text-green-900'
                    : 'text-yellow-900'
                }`}>
                  {whatsappData?.completed 
                    ? isVerificationPending 
                      ? 'Aguardando Verificação' 
                      : 'Etapa Concluída'
                    : 'Etapa Pendente'
                  }
                </h3>
                <p className={`text-sm ${
                  whatsappData?.completed 
                    ? isVerificationPending 
                      ? 'text-orange-700' 
                      : 'text-green-700'
                    : 'text-yellow-700'
                }`}>
                  {whatsappData?.completed 
                    ? isVerificationPending 
                      ? 'Seu número foi configurado mas ainda precisa ser verificado pelo WhatsApp'
                      : 'Seu número WhatsApp está configurado e verificado'
                    : 'Configure seu número WhatsApp para continuar'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {whatsappData?.completed ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Número Configurado</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Número WhatsApp</label>
                    <p className="mt-1 text-gray-900 font-medium">{whatsappData.number || 'Não informado'}</p>
                  </div>
                  {whatsappData.brdidNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Número BRDID</label>
                      <p className="mt-1 text-gray-900 font-mono text-sm">{whatsappData.brdidNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {isVerificationPending && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-orange-900">Verificação Pendente</h3>
                      <p className="mt-1 text-sm text-orange-700">
                        O WhatsApp pode levar até 48 horas para verificar seu número. Você será notificado assim que a verificação for concluída.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={() => router.push('/onboarding')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar Configurações
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Número Não Configurado</h3>
              <p className="text-gray-600 mb-6">
                Você ainda não configurou seu número WhatsApp Business
              </p>
              <button
                onClick={() => router.push('/onboarding')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Configurar Número
              </button>
            </div>
          )}
        </div>

        {/* Próxima Etapa */}
        {whatsappData?.completed && !isVerificationPending && (
          <div className="mt-6 bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-blue-900">Próxima Etapa</h3>
                <p className="mt-1 text-sm text-blue-700">
                  Conecte sua conta Meta Business para integrar com o WhatsApp
                </p>
                <button
                  onClick={() => router.push('/dashboard/onboarding/meta')}
                  className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Configurar Meta Business
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
