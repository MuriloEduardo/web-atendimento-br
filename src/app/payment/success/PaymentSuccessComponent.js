'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStripe } from '@stripe/react-stripe-js';

export default function PaymentSuccessComponent() {
  const stripe = useStripe();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [completionSent, setCompletionSent] = useState(false);

  useEffect(() => {
    if (!stripe) return;

    const clientSecret = searchParams.get('payment_intent_client_secret');
    console.log('[PaymentSuccess] checking intent', { clientSecret });
    
    if (!clientSecret) {
      // Usar timeout para evitar chamada síncrona
      setTimeout(() => setStatus('error'), 0);
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      console.log('[PaymentSuccess] retrievePaymentIntent', paymentIntent);
      switch (paymentIntent.status) {
        case 'succeeded':
          setStatus('succeeded');
          setPaymentDetails(paymentIntent);
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
  }, [stripe, searchParams]);

  useEffect(() => {
    if (status !== 'succeeded' || completionSent) {
      if (status === 'succeeded' && completionSent) {
        console.log('[PaymentSuccess] onboarding completion already sent');
      }
      return;
    }

    const completeOnboarding = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('[PaymentSuccess] completing onboarding', { tokenPresent: Boolean(token) });
        if (!token) {
          return;
        }

        const response = await fetch('/api/onboarding/complete', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          console.log('[PaymentSuccess] onboarding completion success');
          setCompletionSent(true);
        } else {
          console.warn('Não foi possível marcar onboarding como completo após pagamento.');
        }
      } catch (error) {
        console.error('Erro ao concluir onboarding após pagamento:', error);
      }
    };

    completeOnboarding();
  }, [status, completionSent]);

  const redirectToDashboard = () => {
    router.push('/dashboard');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Pagamento em Processamento
          </h2>
          <p className="text-gray-600 mb-6">
            Seu pagamento está sendo processado. Você receberá um email de confirmação em breve.
          </p>
          <button
            onClick={redirectToDashboard}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Ir para Dashboard
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
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
              className="w-full bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
        <div className="text-green-500 text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Pagamento Confirmado!
        </h2>
        <p className="text-gray-600 mb-6">
          Sua assinatura foi ativada com sucesso. Bem-vindo ao AtendimentoBR!
        </p>

        {paymentDetails && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-green-900 mb-2">Detalhes do Pagamento:</h3>
            <div className="space-y-1 text-sm text-green-800">
              <p><strong>ID:</strong> {paymentDetails.id}</p>
              <p><strong>Valor:</strong> R$ {(paymentDetails.amount / 100).toFixed(2)}</p>
              <p><strong>Status:</strong> Confirmado</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={redirectToDashboard}
            className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            🚀 Acessar Dashboard
          </button>
          <p className="text-xs text-gray-500">
            Você receberá um email de confirmação em breve.
          </p>
        </div>

        {/* Próximos passos */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">Próximos Passos:</h3>
          <div className="text-left space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">1.</span>
              Configure sua primeira automação
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">2.</span>
              Conecte seu WhatsApp Business
            </div>
            <div className="flex items-center">
              <span className="text-green-500 mr-2">3.</span>
              Comece a receber leads automaticamente
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}