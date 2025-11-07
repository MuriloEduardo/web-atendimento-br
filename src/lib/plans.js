// Planos de assinatura disponíveis
export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 9700, // em centavos (R$ 97,00)
    currency: 'brl',
    stripePriceId: 'price_starter_monthly', // Substituir pelo ID real do Stripe
    features: ['1000_messages', 'auto_responses', 'basic_chatbot', 'email_support', 'basic_reports']
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 19700, // em centavos (R$ 197,00)
    currency: 'brl',
    stripePriceId: 'price_professional_monthly', // Substituir pelo ID real do Stripe
    features: ['5000_messages', 'advanced_chatbot', 'crm_integration', 'priority_support', 'advanced_reports', 'multiple_numbers', 'custom_api']
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 39700, // em centavos (R$ 397,00)
    currency: 'brl',
    stripePriceId: 'price_enterprise_monthly', // Substituir pelo ID real do Stripe
    features: ['unlimited_messages', 'ai_chatbot', 'full_integration', '24_7_support', 'custom_dashboard', 'multiple_teams', 'white_label']
  }
};