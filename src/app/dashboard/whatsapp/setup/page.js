'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WhatsAppSetup() {
  const router = useRouter();
  const [step, setStep] = useState('select'); // select, purchase, verify
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Carregar localidades disponíveis
  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/brdid/localidades', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLocations(data.locations || []);
      }
    } catch (error) {
      console.error('Erro ao carregar localidades:', error);
    }
  };

  const handleLocationSelect = async (locationCode) => {
    setSelectedLocation(locationCode);
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/brdid/numeros?areaLocal=${locationCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableNumbers(data.numbers || []);
      } else {
        setError('Erro ao buscar números disponíveis');
      }
    } catch (error) {
      setError('Erro ao buscar números. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseNumber = async (number) => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/brdid/adquirir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          numero: number.numero,
          numeroId: number.id,
          areaLocal: selectedLocation,
          cn: number.cn
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSelectedNumber(number);
        setStep('verify');
      } else {
        setError(data.error || 'Erro ao adquirir número');
      }
    } catch (error) {
      setError('Erro ao adquirir número. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📱 Configurar Número WhatsApp
            </h1>
            <p className="text-gray-600">
              Escolha um número para seu atendimento via WhatsApp Business
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-600">Etapa 2 de 4</span>
              <span className="text-sm text-gray-500">50% completo</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '50%' }}></div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Step: Select Location */}
          {step === 'select' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Escolha a Localidade</h2>
                <p className="text-gray-600 mb-6">
                  Selecione a região onde deseja seu número de WhatsApp Business
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {locations.map((location) => (
                    <button
                      key={location.code}
                      onClick={() => handleLocationSelect(location.code)}
                      disabled={isLoading}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left disabled:opacity-50"
                    >
                      <div className="font-semibold text-gray-900">{location.name}</div>
                      <div className="text-sm text-gray-500">DDD: {location.code}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Available Numbers */}
              {selectedLocation && availableNumbers.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Números Disponíveis</h2>
                  <p className="text-gray-600 mb-4">
                    Valor: R$ 26,30/mês por número
                  </p>

                  <div className="space-y-3">
                    {availableNumbers.map((number) => (
                      <div
                        key={number.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div>
                          <div className="font-mono text-lg font-semibold">
                            {number.numero}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {number.id}
                          </div>
                        </div>
                        <button
                          onClick={() => handlePurchaseNumber(number)}
                          disabled={isLoading}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300"
                        >
                          {isLoading ? 'Processando...' : 'Adquirir'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedLocation && availableNumbers.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Nenhum número disponível nesta localidade no momento.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedLocation('');
                      setAvailableNumbers([]);
                    }}
                    className="mt-4 text-blue-600 hover:text-blue-700"
                  >
                    Escolher outra localidade
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step: Verification */}
          {step === 'verify' && selectedNumber && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-4">Número Adquirido com Sucesso!</h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 inline-block">
                <div className="text-sm text-gray-600 mb-2">Seu número WhatsApp Business:</div>
                <div className="font-mono text-2xl font-bold text-green-700">
                  {selectedNumber.numero}
                </div>
              </div>
              <p className="text-gray-600 mb-8">
                Seu número foi configurado e está pronto para ser usado com o WhatsApp Business API.
              </p>
              <button
                onClick={handleFinish}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continuar para Próxima Etapa
              </button>
            </div>
          )}

          {/* Loading */}
          {isLoading && !selectedLocation && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando...</p>
            </div>
          )}

          {/* Back Button */}
          {step === 'select' && !selectedLocation && (
            <div className="mt-8">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Voltar ao Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
