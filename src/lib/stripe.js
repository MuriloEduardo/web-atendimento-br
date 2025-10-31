// Não importar loadStripe diretamente para evitar carregamento automático
// import { loadStripe } from '@stripe/stripe-js';

// Inicializar Stripe com a chave pública
let stripePromise;

export const getStripe = async () => {
  // Verificar se temos uma chave pública válida
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  
  if (!publishableKey || publishableKey === 'pk_test_sua_chave_publicavel_aqui') {
    console.warn('Stripe publishable key não configurada. Usando modo mock.');
    return null;
  }

  if (!stripePromise) {
    // Import dinâmico para evitar carregar Stripe desnecessariamente
    const { loadStripe } = await import('@stripe/stripe-js');
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

// Verificar se Stripe está habilitado
export const isStripeEnabled = () => {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const enabled = Boolean(publishableKey && publishableKey !== 'pk_test_sua_chave_publicavel_aqui');
  if (typeof window !== 'undefined') {
    console.log('[stripe] isStripeEnabled', { publishableKey, enabled });
  }
  return enabled;
};

// Configurações do Stripe
export const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  appearance: {
    theme: 'stripe',
    variables: {
      colorPrimary: '#25d366', // Verde do WhatsApp
      colorBackground: '#ffffff',
      colorText: '#1f2937',
      colorDanger: '#ef4444',
      fontFamily: 'system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
    rules: {
      '.Input': {
        border: '1px solid #d1d5db',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      '.Input:focus': {
        border: '1px solid #25d366',
        boxShadow: '0 0 0 3px rgba(37, 211, 102, 0.1)',
      },
      '.Label': {
        color: '#374151',
        fontSize: '14px',
        fontWeight: '500',
      }
    }
  },
  locale: 'pt-BR'
};