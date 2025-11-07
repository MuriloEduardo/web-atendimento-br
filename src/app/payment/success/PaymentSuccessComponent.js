'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStripe } from '@stripe/react-stripe-js';

export default function PaymentSuccessComponent() {
  const stripe = useStripe();
  const router = useRouter();
  const [status, setStatus] = useState('loading');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [activationStatus, setActivationStatus] = useState('idle');
  const [activationError, setActivationError] = useState('');

  useEffect(() => {
    if (!stripe) return;
    if (typeof window === 'undefined') {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const clientSecret = params.get('payment_intent_client_secret');
    console.log('[PaymentSuccess] checking intent', { clientSecret });

    if (!clientSecret) {
      setTimeout(() => setStatus('error'), 0);
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      console.log('[PaymentSuccess] retrievePaymentIntent', paymentIntent);
      switch (paymentIntent.status) {
        case 'succeeded':
          setStatus('succeeded');
          setPaymentDetails(paymentIntent);
          setActivationStatus('idle');
          break;
        case 'processing':
          setStatus('processing');
          break;
        case 'requires_payment_method':
          setStatus('error');
          break;
        default:
          setStatus('error');
          break;
      }
    });
  }, [stripe]);

  useEffect(() => {
    if (status !== 'succeeded' || !paymentDetails) {
      return;
    }

    if (activationStatus !== 'idle') {
      return;
    }

    const token = localStorage.getItem('token');

    if (!token) {
      setActivationError('Sua sessão expirou. Faça login novamente para concluir a ativação.');
      setActivationStatus('error');
      return;
    }

    const activateSubscription = async () => {
      try {
        setActivationStatus('pending');
        setActivationError('');

        const response = await fetch('/api/subscription/activate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ paymentIntentId: paymentDetails.id })
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || 'Não foi possível ativar sua assinatura');
        }

        setActivationStatus('success');
      } catch (error) {
        console.error('Erro ao ativar assinatura:', error);
        setActivationError(error.message || 'Erro ao ativar sua assinatura.');
        setActivationStatus('error');
      }
    };

    activateSubscription();
  }, [status, paymentDetails, activationStatus]);

  useEffect(() => {
    // Não completar onboarding aqui - ainda há etapas de configuração
    // O onboarding só será concluído após configurar WhatsApp e automações
    if (status === 'succeeded' && activationStatus === 'success') {
      console.log('[PaymentSuccess] Pagamento confirmado - usuário deve continuar configuração');
    }
  }, [status, activationStatus]);

  const redirectToDashboard = () => {
    // Após pagamento, continuar onboarding no step de WhatsApp
    router.push('/onboarding?step=whatsapp-number');
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
            onClick={() => router.push('/onboarding?step=whatsapp-number')}
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
            {activationStatus === 'success'
              ? 'Agora vamos configurar seu WhatsApp Business e suas automações para você começar a atender seus clientes!'
              : 'Estamos finalizando a ativação da sua conta. Em breve você poderá começar!'}
          </p>
        </div>

        {paymentDetails && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-gray-900 mb-3 text-center">📋 Detalhes do Pagamento</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ID da Transação:</span>
                <span className="font-mono text-xs text-gray-800">{paymentDetails.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valor Pago:</span>
                <span className="font-bold text-green-600">R$ {(paymentDetails.amount / 100).toFixed(2)}</span>
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

        {activationStatus === 'pending' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
            Estamos finalizando a ativação da sua conta. Isso leva apenas alguns instantes...
          </div>
        )}

        {activationStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-700">
            <p className="font-medium mb-2">Não foi possível ativar sua assinatura automaticamente.</p>
            <p className="mb-3">{activationError}</p>
            <button
              onClick={retryActivation}
              className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Tentar ativar novamente
            </button>
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
            Seu acesso foi liberado! Vamos configurar tudo agora.
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