'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';

export default function CompanyOnboardingPage() {
  const [user, setUser] = useState(null);
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const loadData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // Carregar dados do usuário
      const userRes = await fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await userRes.json();
      setUser(userData);

      // Carregar status do onboarding
      const statusRes = await fetch('/api/user/onboarding-status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statusData = await statusRes.json();
      setOnboardingStatus(statusData);

      // Carregar dados da empresa
      if (statusData.steps?.company?.companyId) {
        // Aqui você pode criar uma API específica para buscar os dados da empresa
        // Por enquanto vamos usar os dados do status
        setCompany({
          id: statusData.steps.company.companyId,
          name: statusData.steps.company.companyName,
          completed: statusData.steps.company.completed
        });
      }
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
                <span className="ml-1 text-sm font-medium text-gray-500">Informações da Empresa</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header da Página */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-4xl">🏢</span>
            <h1 className="text-3xl font-bold text-gray-900">Informações da Empresa</h1>
          </div>
          <p className="text-gray-600">
            Configure os dados da sua empresa para começar a usar o Atendimento BR
          </p>
        </div>

        {/* Status Card */}
        <div className={`mb-6 p-4 rounded-lg border-2 ${
          company?.completed 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                company?.completed ? 'bg-green-500' : 'bg-yellow-500'
              }`}>
                {company?.completed ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className={`font-semibold ${
                  company?.completed ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  {company?.completed ? 'Etapa Concluída' : 'Etapa Pendente'}
                </h3>
                <p className={`text-sm ${
                  company?.completed ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {company?.completed 
                    ? 'As informações da sua empresa foram cadastradas'
                    : 'Complete os dados da sua empresa para continuar'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário/Informações */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {company?.completed ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Dados Cadastrados</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Nome da Empresa</label>
                    <p className="mt-1 text-gray-900">{company.name || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">ID da Empresa</label>
                    <p className="mt-1 text-gray-900 font-mono text-sm">{company.id}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <button
                  onClick={() => router.push('/onboarding')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar Informações
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Informações Pendentes</h3>
              <p className="text-gray-600 mb-6">
                Você ainda não completou o cadastro da sua empresa
              </p>
              <button
                onClick={() => router.push('/onboarding')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Completar Cadastro
              </button>
            </div>
          )}
        </div>

        {/* Próxima Etapa */}
        {company?.completed && (
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
                  Configure seu número WhatsApp para começar a atender seus clientes
                </p>
                <button
                  onClick={() => router.push('/dashboard/onboarding/whatsapp')}
                  className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Configurar WhatsApp
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
