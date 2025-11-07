'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function WhatsAppSetup() {
    const router = useRouter();
    const [step, setStep] = useState('select');
    const [locations, setLocations] = useState([]);
    const [filteredLocations, setFilteredLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [availableNumbers, setAvailableNumbers] = useState([]);
    const [displayedNumbers, setDisplayedNumbers] = useState([]);
    const [selectedNumber, setSelectedNumber] = useState(null);
    const [isLoadingLocations, setIsLoadingLocations] = useState(true);
    const [isLoadingNumbers, setIsLoadingNumbers] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [numberSearchTerm, setNumberSearchTerm] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [page, setPage] = useState(1);
    const numbersPerPage = 20;
    const loaderRef = useRef(null);

    useEffect(() => {
        loadLocations();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredLocations(locations);
        } else {
            const filtered = locations.filter(loc =>
                loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                loc.code.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredLocations(filtered);
        }
    }, [searchTerm, locations]);

    useEffect(() => {
        if (!selectedLocation || isLoadingNumbers) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && displayedNumbers.length < availableNumbers.length) {
                    loadMoreNumbers();
                }
            },
            { threshold: 0.1 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => observer.disconnect();
    }, [selectedLocation, displayedNumbers, availableNumbers, isLoadingNumbers]);

    const loadLocations = async () => {
        setIsLoadingLocations(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/brdid/localidades', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setLocations(data.locations || []);
                setFilteredLocations(data.locations || []);
            }
        } catch (error) {
            console.error('Erro ao carregar localidades:', error);
            setError('Erro ao carregar localidades. Tente novamente.');
        } finally {
            setIsLoadingLocations(false);
        }
    };

    const handleLocationSelect = async (location) => {
        setSelectedLocation(location);
        setIsLoadingNumbers(true);
        setError('');
        setAvailableNumbers([]);
        setDisplayedNumbers([]);
        setPage(1);
        setNumberSearchTerm('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/brdid/numeros?areaLocal=${location.code}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                const numbers = data.numbers || [];
                setAvailableNumbers(numbers);
                setDisplayedNumbers(numbers.slice(0, numbersPerPage));
            } else {
                setError('Erro ao buscar números disponíveis');
            }
        } catch (error) {
            setError('Erro ao buscar números. Tente novamente.');
        } finally {
            setIsLoadingNumbers(false);
        }
    };

    const loadMoreNumbers = useCallback(() => {
        const nextPage = page + 1;
        const startIndex = page * numbersPerPage;
        const endIndex = startIndex + numbersPerPage;

        const filtered = numberSearchTerm.trim() === ''
            ? availableNumbers
            : availableNumbers.filter(num =>
                num.numero.includes(numberSearchTerm.replace(/\D/g, ''))
            );

        const newNumbers = filtered.slice(startIndex, endIndex);
        setDisplayedNumbers(prev => [...prev, ...newNumbers]);
        setPage(nextPage);
    }, [page, availableNumbers, numberSearchTerm]);

    const handleNumberClick = (number) => {
        setSelectedNumber(number);
        setShowConfirmModal(true);
    };

    const handleConfirmNumber = async () => {
        setIsConfirming(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/brdid/reservar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    codigo: selectedNumber.codigo,
                    numero: selectedNumber.numero,
                    areaLocal: selectedLocation.code,
                    cn: selectedNumber.cn,
                    valorMensal: selectedNumber.valorMensal
                })
            });

            const data = await response.json();

            if (response.ok) {
                setShowConfirmModal(false);
                setStep('confirm');
                setTimeout(() => router.push('/dashboard'), 2000);
            } else {
                setError(data.error || 'Erro ao reservar número');
            }
        } catch (error) {
            setError('Erro ao reservar número. Tente novamente.');
        } finally {
            setIsConfirming(false);
        }
    };

    const handleNumberSearch = (e) => {
        const value = e.target.value;
        setNumberSearchTerm(value);

        if (value.trim() === '') {
            setDisplayedNumbers(availableNumbers.slice(0, numbersPerPage));
            setPage(1);
        } else {
            const filtered = availableNumbers.filter(num =>
                num.numero.includes(value.replace(/\D/g, ''))
            );
            setDisplayedNumbers(filtered.slice(0, numbersPerPage));
            setPage(1);
        }
    };

    if (step === 'confirm') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-md animate-scale-in">
                    <div className="text-7xl mb-6 animate-bounce">✅</div>
                    <h2 className="text-3xl font-bold mb-4 text-gray-900">Número Reservado!</h2>
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                        <div className="text-sm text-gray-600 mb-2">Seu número:</div>
                        <div className="font-mono text-2xl font-bold text-green-700">
                            {selectedNumber?.numeroCompleto || selectedNumber?.numero}
                        </div>
                    </div>
                    <p className="text-gray-600 mb-4">
                        O número será ativado após a confirmação da sua assinatura.
                    </p>
                    <div className="flex items-center justify-center text-blue-600">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                        Redirecionando...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 to-blue-600 px-8 py-6">
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                            <span className="mr-3 text-4xl">📱</span>
                            Configurar Número WhatsApp
                        </h1>
                        <p className="text-green-100">
                            Escolha um número para seu atendimento via WhatsApp Business
                        </p>
                    </div>

                    {/* Progress */}
                    <div className="px-8 py-6 bg-gray-50 border-b">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-600">Etapa 2 de 4</span>
                            <span className="text-sm text-gray-500">50% completo</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all" style={{ width: '50%' }} />
                        </div>
                    </div>

                    <div className="p-8">
                        {error && (
                            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                                <div className="flex"><div className="text-red-500 mr-3">⚠️</div><p className="text-red-700">{error}</p></div>
                            </div>
                        )}

                        {!selectedLocation ? (
                            /* Seleção de Localidade */
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-900">Escolha a Região</h2>
                                    <div className="text-sm text-gray-500">{filteredLocations.length} localidades</div>
                                </div>

                                {/* Search */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Buscar por cidade ou DDD..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    />
                                    <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>

                                {/* Loading Locations */}
                                {isLoadingLocations ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <div className="relative w-24 h-24 mb-6">
                                            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-ping"></div>
                                            <div className="absolute inset-0 border-4 border-t-blue-600 rounded-full animate-spin"></div>
                                        </div>
                                        <p className="text-lg font-medium text-gray-700 animate-pulse">Carregando localidades...</p>
                                    </div>
                                ) : (
                                    /* Locations Grid */
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                                        {filteredLocations.map((location, index) => (
                                            <button
                                                key={location.code}
                                                onClick={() => handleLocationSelect(location)}
                                                className="group p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:shadow-lg transition-all duration-300 text-left transform hover:-translate-y-1"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="text-3xl group-hover:scale-110 transition-transform">📍</div>
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                                        DDD {location.code}
                                                    </span>
                                                </div>
                                                <div className="font-semibold text-gray-900 text-lg mb-1">{location.name}</div>
                                                <div className="text-sm text-gray-500">R$ {location.valorMensal.toFixed(2)}/mês</div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {!isLoadingLocations && filteredLocations.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">🔍</div>
                                        <p className="text-gray-500">Nenhuma localidade encontrada</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Seleção de Números */
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <button onClick={() => { setSelectedLocation(null); setAvailableNumbers([]); setDisplayedNumbers([]); }} className="text-blue-600 hover:text-blue-700 mb-2 flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                            Voltar
                                        </button>
                                        <h2 className="text-2xl font-bold text-gray-900">Números Disponíveis</h2>
                                        <p className="text-gray-600">{selectedLocation.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500">{availableNumbers.length} números</div>
                                        <div className="text-lg font-semibold text-green-600">R$ {selectedLocation.valorMensal.toFixed(2)}/mês</div>
                                    </div>
                                </div>

                                {/* Number Search */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Buscar número específico..."
                                        value={numberSearchTerm}
                                        onChange={handleNumberSearch}
                                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                                    />
                                    <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>

                                {/* Loading Numbers */}
                                {isLoadingNumbers ? (
                                    <div className="flex flex-col items-center justify-center py-20">
                                        <div className="relative w-24 h-24 mb-6">
                                            <div className="absolute inset-0 border-4 border-green-200 rounded-full animate-ping"></div>
                                            <div className="absolute inset-0 border-4 border-t-green-600 rounded-full animate-spin"></div>
                                        </div>
                                        <p className="text-lg font-medium text-gray-700 animate-pulse">Buscando números disponíveis...</p>
                                        <p className="text-sm text-gray-500 mt-2">Isso pode levar alguns segundos</p>
                                    </div>
                                ) : (
                                    /* Numbers List */
                                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                                        {displayedNumbers.map((number, index) => (
                                            <button
                                                key={number.id || index}
                                                onClick={() => handleNumberClick(number)}
                                                className="w-full group p-5 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:shadow-md transition-all duration-300 text-left flex items-center justify-between"
                                                style={{ animationDelay: `${index * 30}ms` }}
                                            >
                                                <div className="flex items-center flex-1">
                                                    <div className="text-3xl mr-4 group-hover:scale-110 transition-transform">📞</div>
                                                    <div>
                                                        <div className="font-mono text-xl font-bold text-gray-900">{number.numeroCompleto || number.numero}</div>
                                                        <div className="text-sm text-gray-500">Código: {number.codigo}</div>
                                                    </div>
                                                </div>
                                                {(number.gold || number.superGold || number.diamante) && (
                                                    <div className="flex gap-1">
                                                        {number.diamante && <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">💎 Diamante</span>}
                                                        {number.superGold && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">⭐ Super Gold</span>}
                                                        {number.gold && <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-semibold">🏆 Gold</span>}
                                                    </div>
                                                )}
                                                <svg className="w-6 h-6 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        ))}

                                        {/* Infinite Scroll Loader */}
                                        {displayedNumbers.length < availableNumbers.length && (
                                            <div ref={loaderRef} className="text-center py-8">
                                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                                <p className="text-gray-500 mt-2">Carregando mais números...</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!isLoadingNumbers && displayedNumbers.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">📵</div>
                                        <p className="text-gray-500">Nenhum número disponível nesta região</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && selectedNumber && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scale-in">
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-4">📱</div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirmar Número</h3>
                            <p className="text-gray-600">Você está escolhendo este número:</p>
                        </div>

                        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                            <div className="text-center">
                                <div className="font-mono text-3xl font-bold text-gray-900 mb-2">
                                    {selectedNumber.numeroCompleto || selectedNumber.numero}
                                </div>
                                <div className="text-sm text-gray-600 mb-3">Código: {selectedNumber.codigo}</div>
                                <div className="text-lg font-semibold text-green-600">
                                    R$ {selectedNumber.valorMensal.toFixed(2)}/mês
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        <strong>Importante:</strong> Este número será reservado e ativado após a confirmação da sua assinatura.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowConfirmModal(false); setSelectedNumber(null); }}
                                disabled={isConfirming}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmNumber}
                                disabled={isConfirming}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all font-semibold disabled:opacity-50 flex items-center justify-center"
                            >
                                {isConfirming ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Reservando...
                                    </>
                                ) : (
                                    'Confirmar Escolha'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
        </div>
    );
}
