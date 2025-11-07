'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';

export default function MetaOnboardingPage() {
  const [user, setUser] = useState(null);
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [metaData, setMetaData] = useState(null);
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
      setMetaData(statusData.steps?.meta);
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

  const isApprovalPending = metaData?.completed && metaData?.businessId && !metaData?.approved;

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
              <span className="text-sm text-gray-500">Meta Business</span>
            </li>
          </ol>
        </nav>

        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-4xl">🔗</span>
            <h1 className="text-3xl font-bold text-gray-900">Meta Business</h1>
          </div>
          <p className="text-gray-600">Conecte sua conta Meta Business para integrar o WhatsApp</p>
        </div>

        <div className={`mb-6 p-4 rounded-lg border-2 ${
          metaData?.completed 
            ? isApprovalPending ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
              metaData?.completed ? isApprovalPending ? 'bg-orange-500' : 'bg-green-500' : 'bg-yellow-500'
            }`}>
              {metaData?.completed ? (
                isApprovalPending ? '⏳' : '✓'
              ) : '⏱'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {metaData?.completed ? isApprovalPending ? 'Aguardando Aprovação' : 'Etapa Concluída' : 'Etapa Pendente'}
              </h3>
              <p className="text-sm text-gray-700">
                {metaData?.completed 
                  ? isApprovalPending 
                    ? 'Meta está analisando sua conta Business. Pode levar até 5 dias úteis'
                    : 'Sua conta Meta Business está conectada e aprovada'
                  : 'Conecte sua conta Meta Business para continuar'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          {metaData?.completed ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Conta Conectada</h2>
                <div className="space-y-3">
                  {metaData.businessId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Business ID</label>
                      <p className="mt-1 text-gray-900 font-mono text-sm">{metaData.businessId}</p>
                    </div>
                  )}
                  {metaData.whatsappBusinessAccountId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">WhatsApp Business Account ID</label>
                      <p className="mt-1 text-gray-900 font-mono text-sm">{metaData.whatsappBusinessAccountId}</p>
                    </div>
                  )}
                </div>
              </div>

              {isApprovalPending && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <span className="text-orange-600">⚠️</span>
                    <div>
                      <h3 className="text-sm font-medium text-orange-900">Aprovação Pendente</h3>
                      <p className="mt-1 text-sm text-orange-700">
                        A Meta está revisando sua conta. Você receberá um email quando a aprovação for concluída.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => router.push('/onboarding')}
                className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50"
              >
                Reconfigurar
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔗</span>
              </div>
              <h3 className="text-lg font-medium mb-2 text-gray-900">Meta Business Não Conectado</h3>
              <p className="text-gray-600 mb-6">Configure a integração com Meta Business</p>
              <button
                onClick={() => router.push('/onboarding')}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Conectar Agora
              </button>
            </div>
          )}
        </div>

        {metaData?.completed && !isApprovalPending && (
          <div className="mt-6 bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-start space-x-3">
              <span className="text-blue-600">ℹ️</span>
              <div>
                <h3 className="text-sm font-medium text-blue-900">Próxima Etapa</h3>
                <p className="mt-1 text-sm text-blue-700">Complete sua assinatura para começar a usar todos os recursos</p>
                <button
                  onClick={() => router.push('/dashboard/onboarding/payment')}
                  className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Configurar Assinatura →
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
