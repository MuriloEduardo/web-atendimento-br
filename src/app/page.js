'use client';

import Link from "next/link";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-start">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6">Atendimento BR</h1>
          <p className="text-lg mb-8 max-w-2xl">
            A melhor plataforma para gerenciar o atendimento ao cliente da sua empresa.
            Centralize todas as conversas, acompanhe métricas e melhore a satisfação dos seus clientes.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => router.push('/cadastro')}
              className="block w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              style={{ backgroundColor: '#25d366' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1da651'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#25d366'}
            >
              Começe agora gratuitamente
            </button>

            <Link
              href="/login"
              className="block w-full bg-white hover:bg-gray-50 text-green-600 font-medium py-3 px-6 rounded-lg border-2 border-green-600 transition-colors"
              style={{ color: '#25d366', borderColor: '#25d366' }}
            >
              Já tenho uma conta
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Chat em tempo real</h3>
              <p className="text-sm">
                Converse com seus clientes em tempo real através de múltiplos canais
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Métricas detalhadas</h3>
              <p className="text-sm">
                Acompanhe o desempenho da sua equipe com relatórios completos
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Resposta rápida</h3>
              <p className="text-sm">
                Automatize respostas e reduza o tempo de atendimento
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
