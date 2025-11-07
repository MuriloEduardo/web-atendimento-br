'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [onboardingStatus, setOnboardingStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phoneNumber: '',
        businessName: '',
        businessType: ''
    });
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

            const userData = await userRes.json();
            const statusData = await statusRes.json();

            setUser(userData);
            setOnboardingStatus(statusData);
            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                phoneNumber: userData.phoneNumber || '',
                businessName: userData.businessName || '',
                businessType: userData.businessType || ''
            });
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage(null);

        const token = localStorage.getItem('token');

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
                setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
            } else {
                const error = await response.json();
                setMessage({ type: 'error', text: error.error || 'Erro ao atualizar perfil' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Erro ao atualizar perfil' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader
                user={user}
                onboardingStatus={onboardingStatus}
                onLogout={() => { localStorage.removeItem('token'); router.push('/login'); }}
            />

            <main className="max-w-4xl mx-auto py-8 px-4">
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
                            <span className="text-sm text-gray-500">Meu Perfil</span>
                        </li>
                    </ol>
                </nav>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Meu Perfil</h1>
                            <p className="text-gray-600">Gerencie suas informações pessoais</p>
                        </div>
                    </div>
                </div>

                {/* Mensagem de Feedback */}
                {message && (
                    <div className={`mb-6 p-4 rounded-lg border-2 ${message.type === 'success'
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                        <div className="flex items-center">
                            {message.type === 'success' ? (
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            )}
                            {message.text}
                        </div>
                    </div>
                )}

                {/* Formulário */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Informações Pessoais</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Nome */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Nome Completo
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                                disabled
                            />
                            <p className="mt-1 text-xs text-gray-500">O email não pode ser alterado</p>
                        </div>

                        {/* Telefone */}
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                Telefone
                            </label>
                            <input
                                type="tel"
                                id="phoneNumber"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="(00) 00000-0000"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        {/* Nome da Empresa */}
                        <div>
                            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                                Nome da Empresa
                            </label>
                            <input
                                type="text"
                                id="businessName"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                        </div>

                        {/* Tipo de Negócio */}
                        <div>
                            <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Negócio
                            </label>
                            <select
                                id="businessType"
                                name="businessType"
                                value={formData.businessType}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            >
                                <option value="">Selecione...</option>
                                <option value="Varejo">Varejo</option>
                                <option value="Serviços">Serviços</option>
                                <option value="E-commerce">E-commerce</option>
                                <option value="Saúde">Saúde</option>
                                <option value="Educação">Educação</option>
                                <option value="Tecnologia">Tecnologia</option>
                                <option value="Outros">Outros</option>
                            </select>
                        </div>

                        {/* Botões */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard')}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {isSaving ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Salvando...
                                    </>
                                ) : (
                                    'Salvar Alterações'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Informações da Conta */}
                <div className="mt-6 bg-gray-50 rounded-xl border border-gray-200 p-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Informações da Conta</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Conta criada em:</span>
                            <span className="font-medium text-gray-900">
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Última atualização:</span>
                            <span className="font-medium text-gray-900">
                                {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('pt-BR') : 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">ID do usuário:</span>
                            <span className="font-mono text-xs text-gray-900">{user?.id}</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
