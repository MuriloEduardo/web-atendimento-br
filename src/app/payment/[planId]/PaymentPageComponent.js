'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

// Carregar Stripe fora do componente para evitar recriar
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const PLAN_DETAILS = {
  starter: {
    planName: 'Starter',
    amount: 9700,
    trial: false,
    description: 'Perfeito para pequenos negócios',
  },
  professional: {
    planName: 'Professional',
    amount: 19700,
    trial: false,
    description: 'Ideal para empresas em crescimento',
  },
  enterprise: {
    planName: 'Enterprise',
    amount: 39700,
    trial: false,
    description: 'Solução completa para grandes empresas',
  },
};

export default function PaymentPageComponent({ params: initialParams }) {
  const [clientSecret, setClientSecret] = useState('');
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [hasSubscription, setHasSubscription] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const router = useRouter();
  const routeParams = useParams();
  const planId = routeParams?.planId || initialParams?.planId || '';

  useEffect(() => {
    if (planId) {
      const fallback = PLAN_DETAILS[planId];
      if (fallback) {
        setPlanData((prev) => ({ ...fallback, ...(prev || {}) }));
      }
    }
  }, [planId]);

  useEffect(() => {
    console.log('[PaymentPage] mount', {
      planId,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      routeParams,
      initialParams,
    });
  }, [planId, routeParams, initialParams]);

  useEffect(() => {
    if (!planId) {
      console.warn('[PaymentPage] missing planId');
      setError('Plano inválido ou não informado. Volte e selecione um plano.');
      setLoading(false);
      return;
    }

    if (!PLAN_DETAILS[planId]) {
      console.warn('[PaymentPage] unknown planId', { planId });
      setError('Plano não encontrado. Volte e selecione um plano válido.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const resetState = () => {
      setError('');
      setInfoMessage('');
      setHasSubscription(false);
      setSubscription(null);
      setClientSecret('');
      setLoading(true);
    };

    resetState();

    const preparePayment = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('[PaymentPage] createPaymentIntent:start', { planId, tokenPresent: Boolean(token) });
        if (!token) {
          setError('Você precisa estar logado para finalizar o pagamento. Faça login e tente novamente.');
          setLoading(false);
          return;
        }

        // Garantir que a empresa existe antes de criar payment intent
        try {
          const companyCheckResponse = await fetch('/api/company/current', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (companyCheckResponse.status === 404) {
            // Empresa não existe, criar uma empresa padrão
            console.log('[PaymentPage] Company not found, creating default company');
            const createCompanyResponse = await fetch('/api/onboarding/business-info', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                businessName: 'Minha Empresa',
                businessType: 'Outros',
                website: null
              })
            });

            if (!createCompanyResponse.ok) {
              console.error('[PaymentPage] Failed to create company');
              setError('Erro ao configurar sua empresa. Por favor, volte e preencha os dados da empresa.');
              setLoading(false);
              return;
            }
          }
        } catch (companyError) {
          console.error('[PaymentPage] company check error', companyError);
        }

        // Verificar se usuário já possui assinatura ativa
        try {
          const statusResponse = await fetch('/api/subscription/status', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (statusResponse.status === 401) {
            if (cancelled) return;
            localStorage.removeItem('token');
            setError('Sua sessão expirou. Faça login novamente para continuar.');
            setLoading(false);
            setTimeout(() => router.push('/login'), 1000);
            return;
          }

          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            console.log('[PaymentPage] subscriptionStatus', statusData);

            if (statusData.hasSubscription) {
              const currentStatus = statusData.subscription?.status;

              if (currentStatus === 'active') {
                if (cancelled) return;
                setHasSubscription(true);
                setSubscription(statusData.subscription);
                setPlanData((prev) => ({
                  ...(prev || {}),
                  planName: statusData.subscription?.planName || prev?.planName,
                  amount: statusData.subscription?.price ?? prev?.amount,
                  trial: false,
                  subscriptionStatus: currentStatus
                }));
                setInfoMessage('Você já possui uma assinatura ativa. Não é necessário realizar um novo pagamento agora.');
                setLoading(false);
                return;
              }

              if (currentStatus === 'trialing') {
                setSubscription(statusData.subscription);
                setPlanData((prev) => ({
                  ...(prev || {}),
                  planName: statusData.subscription?.planName || prev?.planName,
                  amount: statusData.subscription?.price ?? prev?.amount,
                  trial: false,
                  subscriptionStatus: currentStatus
                }));
                setInfoMessage('Identificamos um pagamento pendente. Conclua o pagamento abaixo para ativar sua assinatura definitivamente.');
              }
            }
          } else {
            console.warn('[PaymentPage] subscription status response not ok', statusResponse.status);
          }
        } catch (statusError) {
          console.error('[PaymentPage] subscription status error', statusError);
        }

        const response = await fetch('/api/payment/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            planId: planId,
            trial: false
          })
        });

        console.log('[PaymentPage] createPaymentIntent:response', { status: response.status });
        if (response.status === 401) {
          localStorage.removeItem('token');
          setError('Sua sessão expirou. Faça login novamente para continuar.');
          setLoading(false);
          setTimeout(() => router.push('/login'), 1000);
          return;
        }

        if (!response.ok) {
          throw new Error('Erro ao criar payment intent');
        }

        const data = await response.json();
        console.log('[PaymentPage] createPaymentIntent:success', data);
        if (cancelled) return;
        setClientSecret(data.clientSecret);
        setPlanData((prev) => ({ ...(prev || {}), ...data }));
      } catch (err) {
        console.error('Erro:', err);
        if (!cancelled) {
          setError('Erro ao carregar pagamento. Tente novamente.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    preparePayment();

    return () => {
      cancelled = true;
    };
  }, [planId, router]);

  const appearance = {
    theme: 'stripe',
    variables: {
      colorPrimary: '#25d366',
      colorBackground: '#ffffff',
      colorText: '#1a1a1a',
      colorDanger: '#df1b41',
      fontFamily: 'Ideal Sans, system-ui, sans-serif',
      spacingUnit: '2px',
      borderRadius: '8px',
    },
    rules: {
      '.Tab': {
        border: '1px solid #e6e6e6',
        borderRadius: '8px',
      },
      '.Tab:hover': {
        color: '#25d366',
      },
      '.Tab--selected': {
        backgroundColor: '#25d366',
        color: '#ffffff',
      },
    }
  };

  const options = {
    clientSecret,
    appearance,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pagamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 hover:bg-gray-100 text-gray-500 rounded-lg transition-colors"
              >
                ←
              </button>
              <h1 className="text-xl text-gray-500 font-semibold">
                Finalizar Assinatura
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              🔒 Pagamento Seguro
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resumo do Plano */}
          <div className="bg-white text-gray-700 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Resumo do Pedido
            </h2>

            {hasSubscription && subscription ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800">
                    Você já possui o plano {subscription.planName}
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Status atual: <span className="font-medium capitalize">{subscription.status}</span>
                  </p>
                  {subscription.status === 'trialing' && typeof subscription.daysLeft === 'number' && (
                    <p className="text-sm text-green-700 mt-1">
                      Dias restantes de teste: <span className="font-medium">{subscription.daysLeft}</span>
                    </p>
                  )}
                  <p className="text-sm text-green-700 mt-2">
                    Gerencie sua assinatura no dashboard.
                  </p>
                </div>

                <div className="flex justify-between items-center p-4 bg-white border border-green-100 rounded-lg">
                  <div>
                    <h4 className="font-medium">
                      Valor da assinatura
                    </h4>
                    <p className="text-sm">Cobrado mensalmente</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      R$ {((subscription.price ?? planData?.amount ?? 0) / 100).toFixed(2)}
                    </div>
                    <div className="text-sm">/mês</div>
                  </div>
                </div>
              </div>
            ) : planData ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <h3 className="font-medium">
                      Plano {planData.planName}
                    </h3>
                    <p className="text-sm">
                      Cobrança mensal
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      R$ {((planData.amount ?? 0) / 100).toFixed(2)}
                    </div>
                    <div className="text-sm">/mês</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      Total:
                    </span>
                    <span className="font-semibold text-xl text-green-600">
                      R$ {((planData.amount ?? 0) / 100).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                Não encontramos informações deste plano. Volte e selecione outro para continuar.
              </div>
            )}
          </div>

          {/* Formulário de Pagamento */}
          <div className="bg-white text-gray-700 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Informações de Pagamento
            </h2>

            {hasSubscription && subscription ? (
              <div className="p-4 bg-green-50 border border-green-200 text-sm text-green-700 rounded-lg">
                {infoMessage || 'Assinatura ativa detectada.'}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Ir para o dashboard
                  </button>
                  <button
                    onClick={() => router.back()}
                    className="px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            ) : (
              <>
                {infoMessage && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 text-sm text-blue-700 rounded-lg">
                    {infoMessage}
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 text-sm text-red-700 rounded-lg">
                    {error}
                    {error.includes('logado') && (
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => router.push('/login')}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Fazer login
                        </button>
                        <button
                          onClick={() => router.back()}
                          className="px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                        >
                          Voltar
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {clientSecret && !error && (
                  <Elements options={options} stripe={stripePromise}>
                    <CheckoutForm planData={planData} />
                  </Elements>
                )}

                {!clientSecret && !error && (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-500 text-sm">
                    Preparando o checkout seguro...
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}