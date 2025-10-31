'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentSuccessComponent from './PaymentSuccessComponent';

// Carregar Stripe fora do componente
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function PaymentSuccessPage() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentSuccessComponent />
    </Elements>
  );
}