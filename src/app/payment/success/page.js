'use client';

import { Suspense } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentSuccessComponent from './PaymentSuccessComponent';

// Carregar Stripe fora do componente
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function PaymentSuccessPage() {
  return (
    <Elements stripe={stripePromise}>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      }>
        <PaymentSuccessComponent />
      </Suspense>
    </Elements>
  );
}