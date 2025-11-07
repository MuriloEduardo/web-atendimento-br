'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MetaBusinessSetup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    businessId: '',
    whatsappBusinessAccountId: '',
    phoneNumberId: '',
    accessToken: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/onboarding/meta-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Erro ao configurar Meta Business');
      }
    } catch (error) {
      setError('Erro ao configurar. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white text-black rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🔗 Configurar Meta Business API
            </h1>
            <p className="text-gray-600">
              Conecte sua conta do WhatsApp Business à Meta Business API
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-600">Etapa 3 de 4</span>
              <span className="text-sm text-gray-500">75% completo</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <span className="mr-2">ℹ️</span>
              Como obter suas credenciais Meta Business
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
              <li>Acesse o <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">Facebook Business Manager</a></li>
              <li>Vá em Configurações {'>'} Contas do WhatsApp Business</li>
              <li>Selecione sua conta ou crie uma nova</li>
              <li>Copie o Business ID e WhatsApp Business Account ID</li>
              <li>Em Ferramentas de Sistema, gere um Access Token permanente</li>
            </ol>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="businessId" className="block text-sm font-medium text-gray-700 mb-2">
                Meta Business ID *
              </label>
              <input
                type="text"
                id="businessId"
                name="businessId"
                required
                value={formData.businessId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                placeholder="123456789012345"
              />
              <p className="mt-1 text-sm text-gray-500">
                ID da sua conta Meta Business Manager
              </p>
            </div>

            <div>
              <label htmlFor="whatsappBusinessAccountId" className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Business Account ID *
              </label>
              <input
                type="text"
                id="whatsappBusinessAccountId"
                name="whatsappBusinessAccountId"
                required
                value={formData.whatsappBusinessAccountId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                placeholder="123456789012345"
              />
              <p className="mt-1 text-sm text-gray-500">
                ID da sua conta WhatsApp Business
              </p>
            </div>

            <div>
              <label htmlFor="phoneNumberId" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number ID *
              </label>
              <input
                type="text"
                id="phoneNumberId"
                name="phoneNumberId"
                required
                value={formData.phoneNumberId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                placeholder="123456789012345"
              />
              <p className="mt-1 text-sm text-gray-500">
                ID do número de telefone vinculado
              </p>
            </div>

            <div>
              <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700 mb-2">
                Access Token Permanente *
              </label>
              <textarea
                id="accessToken"
                name="accessToken"
                required
                value={formData.accessToken}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="EAAxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
              <p className="mt-1 text-sm text-gray-500">
                Token de acesso gerado no Facebook Business Manager
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <span className="text-yellow-600 mr-2">⚠️</span>
                <div className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Mantenha seu Access Token em segurança. 
                  Ele permite acesso completo à API do WhatsApp Business.
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
              >
                {isLoading ? 'Configurando...' : 'Continuar'}
              </button>
            </div>
          </form>

          {/* Help Links */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Precisa de ajuda?</h3>
            <div className="space-y-2 text-sm">
              <a
                href="https://developers.facebook.com/docs/whatsapp/business-management-api/get-started"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:text-blue-700 hover:underline"
              >
                📚 Documentação oficial da Meta
              </a>
              <a
                href="https://business.facebook.com/settings/whatsapp-business-accounts"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-blue-600 hover:text-blue-700 hover:underline"
              >
                🔗 Gerenciar Contas WhatsApp Business
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
