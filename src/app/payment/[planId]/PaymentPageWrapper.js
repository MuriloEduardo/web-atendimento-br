'use client';

import dynamic from 'next/dynamic';

const PaymentPageComponent = dynamic(() => import('./PaymentPageComponent'), {
    ssr: false,
});

export default function PaymentPage({ params }) {
    return <PaymentPageComponent params={params} />;
}
