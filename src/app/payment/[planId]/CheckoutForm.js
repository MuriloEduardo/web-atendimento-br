'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useStripe,
  useElements,
  PaymentElement,
  LinkAuthenticationElement,
  AddressElement
} from '@stripe/react-stripe-js';

export default function CheckoutForm({ planData }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success`,
        receipt_email: email,
      },
    });

    if (error) {
      if (error.type === 'card_error' || error.type === 'validation_error') {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Ocorreu um erro inesperado. Tente novamente.');
      }
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email para Link Authentication */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Email para recibo
        </label>
        <LinkAuthenticationElement
          onReady={() => {
            console.log('LinkAuthenticationElement [ready]');
          }}
          onChange={(event) => {
            setEmail(event.value.email);
          }}
          options={{
            defaultValues: {
              email: email,
            },
          }}
        />
      </div>

      {/* Elemento de Pagamento */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Informações do Cartão
        </label>
        <PaymentElement
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
            fields: {
              billingDetails: {
                name: 'auto',
                email: 'auto',
                phone: 'auto',
                address: {
                  line1: 'auto',
                  line2: 'auto',
                  city: 'auto',
                  state: 'auto',
                  postalCode: 'auto',
                  country: 'auto',
                },
              },
            },
            terms: {
              card: 'never',
            },
          }}
        />
      </div>

      {/* Endereço de Cobrança */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Endereço de Cobrança
        </label>
        <AddressElement
          options={{
            mode: 'billing',
            allowedCountries: ['BR'],
            fields: {
              phone: 'always',
            },
            validation: {
              phone: {
                required: 'always',
              },
            },
          }}
        />
      </div>

      {/* Mensagem de Erro */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-400 mr-2">⚠️</div>
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Erro no Pagamento
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {errorMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Informações de Segurança */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center text-sm">
          <div className="mr-2">🔒</div>
          <div>
            <p className="font-medium">Pagamento 100% Seguro</p>
            <p>Seus dados são protegidos com criptografia SSL de 256 bits</p>
          </div>
        </div>
      </div>

      {/* Botão de Submissão */}
      <button
        type="submit"
        disabled={!stripe || !elements || isLoading}
        className="w-full bg-green-500 text-white font-medium py-3 px-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processando...
          </>
        ) : (
          <>💳 Confirmar pagamento - R$ {planData ? (planData.amount / 100).toFixed(2) : '0,00'}</>
        )}
      </button>

      {/* Links de Apoio */}
      <div className="text-center space-y-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Voltar para seleção de planos
        </button>
        <div className="text-xs text-gray-400">
          Dúvidas? Entre em contato: suporte@atendimentobr.com
        </div>
      </div>
    </form>
  );
}