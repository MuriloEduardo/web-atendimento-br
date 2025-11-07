'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentSuccessComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      setStatus('error');
      return;
    }

    // Verificar status da sessão
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          setStatus('error');
          return;
        }

        // Buscar detalhes da sessão
        const response = await fetch(`/api/stripe/session?session_id=${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao verificar sessão');
        }

        const data = await response.json();
        setSessionData(data);

        // Se pagamento foi bem-sucedido
        if (data.payment_status === 'paid') {
          setStatus('succeeded');

          // Ativar assinatura
          await fetch('/api/subscription/activate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ sessionId })
          });
        } else {
          setStatus('processing');
        }
      } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
        setStatus('error');
      }
    };

    checkSession();
  }, [searchParams]);

  useEffect(() => {
    if (status === 'succeeded') {
      // Redirecionar para dashboard após 3 segundos
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    }
  }, [status, router]);

  const redirectToDashboard = () => {
    // Redirecionar para o dashboard onde onboarding continuará
    router.push('/dashboard');
  };

  const retryActivation = () => {
    if (activationStatus === 'error') {
      setActivationError('');
      setActivationStatus('idle');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">
            Verificando Pagamento...
          </h2>
          <p className="text-gray-600">
            Aguarde enquanto confirmamos seu pagamento.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-yellow-500 text-6xl mb-4">⏳</div>
          <h2 className="text-xl font-semibold mb-2">
            Pagamento em Processamento
          </h2>
          <p className="text-gray-600 mb-6">
            Seu pagamento está sendo processado. Você receberá um email de confirmação em breve.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Continuar Configuração
          </button>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold mb-2">
            Erro no Pagamento
          </h2>
          <p className="text-gray-600 mb-6">
            Houve um problema com seu pagamento. Tente novamente ou entre em contato conosco.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.back()}
              className="w-full bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Tentar Novamente
            </button>
            <button
              onClick={redirectToDashboard}
              className="w-full bg-gray-300 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // status === 'succeeded'
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-2xl w-full">
        {/* Ícone de sucesso animado */}
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <div className="text-green-500 text-5xl animate-bounce">✅</div>
          </div>
        </div>

        {/* Título principal */}
        <h2 className="text-3xl font-bold mb-3 text-gray-900">
          🎉 Pagamento Confirmado!
        </h2>

        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
          <p className="text-lg font-semibold text-green-800 mb-2">
            Sua assinatura está ativa!
          </p>
          <p className="text-green-700">
            Agora vamos configurar seu WhatsApp Business e suas automações para você começar a atender seus clientes!
          </p>
        </div>

        {sessionData && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-gray-900 mb-3 text-center">📋 Detalhes do Pagamento</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-800">{sessionData.customer_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Confirmado
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={redirectToDashboard}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            ✨ Continuar Configuração →
          </button>
          <p className="text-sm text-gray-500">
            Redirecionando automaticamente em 3 segundos...
          </p>
        </div>

        {/* Próximos passos */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-lg mb-4 text-gray-900">🚀 Próximas Etapas</h3>
          <div className="text-left space-y-3">
            <div className="flex items-start bg-gray-50 p-3 rounded-lg">
              <span className="text-green-500 mr-3 mt-0.5 font-bold">✓</span>
              <div className="flex-1">
                <span className="text-gray-400 line-through block">Escolher plano e realizar pagamento</span>
                <span className="text-xs text-gray-500">Concluído com sucesso</span>
              </div>
            </div>
            <div className="flex items-start bg-green-50 border-2 border-green-200 p-3 rounded-lg">
              <span className="text-green-600 mr-3 mt-0.5 font-bold">→</span>
              <div className="flex-1">
                <span className="font-semibold text-green-900 block">Configurar número do WhatsApp</span>
                <span className="text-xs text-green-700">Próximo passo - escolha ou compre seu número</span>
              </div>
            </div>
            <div className="flex items-start bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-400 mr-3 mt-0.5">3</span>
              <div className="flex-1">
                <span className="text-gray-600 block">Conectar Meta Business API</span>
                <span className="text-xs text-gray-500">Vincular sua conta do WhatsApp Business</span>
              </div>
            </div>
            <div className="flex items-start bg-gray-50 p-3 rounded-lg">
              <span className="text-gray-400 mr-3 mt-0.5">4</span>
              <div className="flex-1">
                <span className="text-gray-600 block">Configurar suas automações</span>
                <span className="text-xs text-gray-500">Definir mensagens automáticas e regras</span>
              </div>
            </div>
          </div>
        </div>

        {/* Nota de email */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            📧 Você receberá um email de confirmação com todos os detalhes da sua assinatura.
          </p>
        </div>
      </div>
    </div>
  );
}