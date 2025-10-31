'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CheckoutSuccess() {
  const [status, setStatus] = useState('loading');
  const [sessionData, setSessionData] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const verifyCheckoutSession = useCallback(async (sessionId) => {
    try {
      const response = await fetch(`/api/stripe/create-checkout-session?session_id=${sessionId}`);
      const data = await response.json();
      
      if (response.ok) {
        setSessionData(data);
        setStatus('success');
        
        // Redirecionar para dashboard após 3 segundos
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      setStatus('error');
    }
  }, [router]);
  
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      verifyCheckoutSession(sessionId);
    } else {
      setStatus('error');
    }
  }, [searchParams, verifyCheckoutSession]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4">Verificando pagamento...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-bold">Erro na verificação</h2>
          <p className="mt-2">
            Houve um problema ao verificar seu pagamento. Entre em contato conosco.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            style={{ backgroundColor: '#25d366' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1da651'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#25d366'}
          >
            Ir para Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="mt-4 text-2xl font-bold">Pagamento Confirmado! 🎉</h2>
        
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">
            Sua assinatura foi confirmada com sucesso!
          </p>
          <p className="text-green-700 text-sm mt-2">
            Você receberá um email de confirmação em: {sessionData?.customerEmail}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900">Próximos passos:</h3>
            <ul className="text-sm text-blue-800 mt-2 space-y-1 text-left">
              <li>• Configure seu WhatsApp no dashboard</li>
              <li>• Nossa equipe iniciará a configuração</li>
              <li>• Você receberá updates por email</li>
              <li>• Em 1-3 dias úteis tudo estará funcionando</li>
            </ul>
          </div>
        </div>

        <p className="mt-6 text-sm">
          Redirecionando para o dashboard em 3 segundos...
        </p>
        
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
          style={{ backgroundColor: '#25d366' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#1da651'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#25d366'}
        >
          Ir para Dashboard Agora
        </button>
      </div>
    </div>
  );
}