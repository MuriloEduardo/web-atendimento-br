'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Atendimento BR!',
    description: 'Vamos configurar sua conta em alguns passos simples.',
    component: 'WelcomeStep'
  },
  {
    id: 'profile',
    title: 'Complete seu perfil',
    description: 'Adicione algumas informações sobre você e sua empresa.',
    component: 'ProfileStep'
  },
  {
    id: 'preferences',
    title: 'Configure suas preferências',
    description: 'Como você gostaria de receber notificações?',
    component: 'PreferencesStep'
  },
  {
    id: 'verification',
    title: 'Verificação de email',
    description: 'Enviamos um email de confirmação. Verifique sua caixa de entrada.',
    component: 'VerificationStep'
  }
];

// Componente de boas-vindas
const WelcomeStep = ({ onNext }) => (
  <div className="text-center space-y-6">
    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
    <div className="space-y-4">
      <p className="text-lg text-gray-600">
        Obrigado por se juntar ao Atendimento BR! Estamos animados para ajudá-lo a melhorar seu atendimento ao cliente.
      </p>
      <p className="text-sm text-gray-500">
        Este processo pode ser completado ao longo de vários dias. Você pode sair a qualquer momento e continuar depois.
      </p>
    </div>
    <button
      onClick={onNext}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Começar configuração
    </button>
  </div>
);

// Componente do perfil
const ProfileStep = ({ onNext, onBack }) => {
  const [profile, setProfile] = useState({
    company: '',
    phone: '',
    website: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Salvar perfil via API
    try {
      await fetch('/api/onboarding/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profile)
      });
      onNext();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">
            Nome da empresa
          </label>
          <input
            type="text"
            id="company"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
            value={profile.company}
            onChange={(e) => setProfile({ ...profile, company: e.target.value })}
            placeholder="Sua empresa"
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Telefone de contato
          </label>
          <input
            type="tel"
            id="phone"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            placeholder="(11) 99999-9999"
          />
        </div>
        
        <div>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700">
            Website (opcional)
          </label>
          <input
            type="url"
            id="website"
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
            value={profile.website}
            onChange={(e) => setProfile({ ...profile, website: e.target.value })}
            placeholder="https://suaempresa.com"
          />
        </div>
      </div>
      
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Voltar
        </button>
        <button
          type="submit"
          className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Continuar
        </button>
      </div>
    </form>
  );
};

// Componente de preferências
const PreferencesStep = ({ onNext, onBack }) => {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await fetch('/api/onboarding/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(preferences)
      });
      onNext();
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center">
          <input
            id="email-notifications"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            checked={preferences.emailNotifications}
            onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
          />
          <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-900">
            Receber notificações por email
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            id="sms-notifications"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            checked={preferences.smsNotifications}
            onChange={(e) => setPreferences({ ...preferences, smsNotifications: e.target.checked })}
          />
          <label htmlFor="sms-notifications" className="ml-2 block text-sm text-gray-900">
            Receber notificações por SMS
          </label>
        </div>
        
        <div className="flex items-center">
          <input
            id="push-notifications"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            checked={preferences.pushNotifications}
            onChange={(e) => setPreferences({ ...preferences, pushNotifications: e.target.checked })}
          />
          <label htmlFor="push-notifications" className="ml-2 block text-sm text-gray-900">
            Receber notificações push
          </label>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Voltar
        </button>
        <button
          type="submit"
          className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Continuar
        </button>
      </div>
    </form>
  );
};

// Componente de verificação
const VerificationStep = ({ onNext, onBack }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();

  const checkVerification = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('/api/onboarding/check-verification', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.verified) {
        setIsVerified(true);
        // Concluir onboarding
        await fetch('/api/onboarding/complete', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Erro ao verificar email:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const resendEmail = async () => {
    try {
      await fetch('/api/onboarding/resend-verification', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      alert('Email de verificação reenviado!');
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
    }
  };

  if (isVerified) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Email verificado com sucesso!</h3>
          <p className="text-sm text-gray-500 mt-2">
            Redirecionando para o dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
          <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          Enviamos um email de verificação para sua caixa de entrada. 
          Clique no link do email para continuar.
        </p>
      </div>
      
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={checkVerification}
          disabled={isChecking}
          className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isChecking ? 'Verificando...' : 'Já verifiquei'}
        </button>
      </div>
      
      <div className="text-center">
        <button
          type="button"
          onClick={resendEmail}
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          Reenviar email de verificação
        </button>
      </div>
      
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Você pode sair e continuar este processo mais tarde.
        </p>
      </div>
    </div>
  );
};

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Verificar se usuário está logado
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Carregar progresso do onboarding
    const loadOnboardingProgress = async () => {
      try {
        const response = await fetch('/api/onboarding/progress', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        
        if (data.completed) {
          router.push('/dashboard');
        } else {
          setCurrentStep(data.currentStep || 0);
          setCompletedSteps(data.completedSteps || []);
        }
      } catch (error) {
        console.error('Erro ao carregar progresso:', error);
      }
    };

    loadOnboardingProgress();
  }, [router]);

  const goToNext = () => {
    const newCompletedSteps = [...completedSteps, currentStep];
    setCompletedSteps(newCompletedSteps);
    
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];

  const renderStepComponent = () => {
    switch (currentStepData.component) {
      case 'WelcomeStep':
        return <WelcomeStep onNext={goToNext} />;
      case 'ProfileStep':
        return <ProfileStep onNext={goToNext} onBack={goToPrevious} />;
      case 'PreferencesStep':
        return <PreferencesStep onNext={goToNext} onBack={goToPrevious} />;
      case 'VerificationStep':
        return <VerificationStep onNext={goToNext} onBack={goToPrevious} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Configuração da conta</h1>
          <p className="mt-2 text-sm text-gray-600">
            Passo {currentStep + 1} de {ONBOARDING_STEPS.length}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-lg shadow px-6 py-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-sm text-gray-600">
              {currentStepData.description}
            </p>
          </div>
          
          {renderStepComponent()}
        </div>

        {/* Skip option */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Pular por agora (continuar mais tarde)
          </button>
        </div>
      </div>
    </div>
  );
}