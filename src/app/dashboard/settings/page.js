'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';

export default function SettingsPage() {
    const [user, setUser] = useState(null);
    const [onboardingStatus, setOnboardingStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('notifications');
    const router = useRouter();

    const loadData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            const [userRes, statusRes] = await Promise.all([
                fetch('/api/user/profile', { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch('/api/user/onboarding-status', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            setUser(await userRes.json());
            setOnboardingStatus(await statusRes.json());
        } catch (error) {
            console.error('Erro:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    const tabs = [
        { id: 'notifications', name: 'Notificações', icon: '🔔' },
        { id: 'security', name: 'Segurança', icon: '🔒' },
        { id: 'preferences', name: 'Preferências', icon: '⚙️' },
        { id: 'integrations', name: 'Integrações', icon: '🔗' }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader
                user={user}
                onboardingStatus={onboardingStatus}
                onLogout={() => { localStorage.removeItem('token'); router.push('/login'); }}
            />

            <main className="max-w-6xl mx-auto py-8 px-4">
                {/* Breadcrumb */}
                <nav className="flex mb-8">
                    <ol className="inline-flex items-center space-x-1">
                        <li>
                            <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-700 hover:text-green-600">
                                Dashboard
                            </button>
                        </li>
                        <li className="flex items-center">
                            <svg className="w-3 h-3 text-gray-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm text-gray-500">Configurações</span>
                        </li>
                    </ol>
                </nav>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
                    <p className="text-gray-600">Personalize sua experiência na plataforma</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar com Tabs */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <nav className="space-y-1 p-2">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                                ? 'bg-green-50 text-green-700 border-l-4 border-green-500'
                                                : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-xl">{tab.icon}</span>
                                        <span>{tab.name}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="lg:col-span-3">
                        {/* Notificações */}
                        {activeTab === 'notifications' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b">
                                    <h2 className="text-lg font-semibold text-gray-900">🔔 Notificações</h2>
                                    <p className="text-sm text-gray-600 mt-1">Gerencie como você recebe notificações</p>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium text-gray-900">Notificações por Email</h3>
                                            <p className="text-sm text-gray-600 mt-1">Receba atualizações importantes por email</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium text-gray-900">Notificações Push</h3>
                                            <p className="text-sm text-gray-600 mt-1">Receba notificações no navegador</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium text-gray-900">Novos Atendimentos</h3>
                                            <p className="text-sm text-gray-600 mt-1">Seja notificado quando receber uma nova mensagem</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium text-gray-900">Relatórios Semanais</h3>
                                            <p className="text-sm text-gray-600 mt-1">Receba um resumo semanal de suas métricas</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Segurança */}
                        {activeTab === 'security' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-red-50 to-red-100 px-6 py-4 border-b">
                                    <h2 className="text-lg font-semibold text-gray-900">🔒 Segurança</h2>
                                    <p className="text-sm text-gray-600 mt-1">Mantenha sua conta segura</p>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="border-2 border-gray-200 rounded-lg p-4">
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">Alterar Senha</h3>
                                        <p className="text-sm text-gray-600 mb-4">É recomendado alterar sua senha regularmente</p>
                                        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm">
                                            Alterar Senha
                                        </button>
                                    </div>

                                    <div className="border-2 border-gray-200 rounded-lg p-4">
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">Autenticação em Dois Fatores (2FA)</h3>
                                        <p className="text-sm text-gray-600 mb-4">Adicione uma camada extra de segurança à sua conta</p>
                                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                                            Configurar 2FA
                                        </button>
                                    </div>

                                    <div className="border-2 border-gray-200 rounded-lg p-4">
                                        <h3 className="text-sm font-medium text-gray-900 mb-2">Sessões Ativas</h3>
                                        <p className="text-sm text-gray-600 mb-4">Gerencie dispositivos conectados à sua conta</p>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    <div>
                                                        <p className="text-sm font-medium">Sessão atual</p>
                                                        <p className="text-xs text-gray-500">Linux • Chrome</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-green-600 font-medium">Ativo agora</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Preferências */}
                        {activeTab === 'preferences' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-6 py-4 border-b">
                                    <h2 className="text-lg font-semibold text-gray-900">⚙️ Preferências</h2>
                                    <p className="text-sm text-gray-600 mt-1">Personalize sua experiência</p>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Idioma</label>
                                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                                            <option>Português (Brasil)</option>
                                            <option>English</option>
                                            <option>Español</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Fuso Horário</label>
                                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                                            <option>América/São Paulo (GMT-3)</option>
                                            <option>América/Manaus (GMT-4)</option>
                                            <option>América/Fortaleza (GMT-3)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-900 mb-2">Formato de Data</label>
                                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                                            <option>DD/MM/YYYY</option>
                                            <option>MM/DD/YYYY</option>
                                            <option>YYYY-MM-DD</option>
                                        </select>
                                    </div>

                                    <div className="flex items-start justify-between pt-4 border-t">
                                        <div className="flex-1">
                                            <h3 className="text-sm font-medium text-gray-900">Modo Escuro</h3>
                                            <p className="text-sm text-gray-600 mt-1">Ative o tema escuro para reduzir o cansaço visual</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Integrações */}
                        {activeTab === 'integrations' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-green-50 to-green-100 px-6 py-4 border-b">
                                    <h2 className="text-lg font-semibold text-gray-900">🔗 Integrações</h2>
                                    <p className="text-sm text-gray-600 mt-1">Conecte suas ferramentas favoritas</p>
                                </div>
                                <div className="p-6 space-y-4">
                                    {[
                                        { name: 'WhatsApp Business', icon: '💬', status: 'connected', description: 'Conectado e funcionando' },
                                        { name: 'Meta Business', icon: '🔵', status: 'connected', description: 'Conectado via API' },
                                        { name: 'Google Sheets', icon: '📊', status: 'available', description: 'Exporte dados automaticamente' },
                                        { name: 'Slack', icon: '💬', status: 'available', description: 'Receba notificações no Slack' },
                                        { name: 'Zapier', icon: '⚡', status: 'available', description: 'Conecte com 5.000+ apps' }
                                    ].map((integration, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <span className="text-3xl">{integration.icon}</span>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-900">{integration.name}</h3>
                                                    <p className="text-xs text-gray-600">{integration.description}</p>
                                                </div>
                                            </div>
                                            {integration.status === 'connected' ? (
                                                <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm">
                                                    Desconectar
                                                </button>
                                            ) : (
                                                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                                                    Conectar
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
