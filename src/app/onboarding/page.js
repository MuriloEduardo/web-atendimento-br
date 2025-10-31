'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isStripeEnabled } from '@/lib/stripe';

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Atendimento BR!',
    subtitle: 'Vamos automatizar seu WhatsApp em poucos passos',
    description: 'Transforme seu atendimento no WhatsApp com nossa plataforma de automação profissional.',
    component: 'WelcomeStep'
  },
  {
    id: 'business-info',
    title: 'Sobre sua empresa',
    subtitle: 'Informações básicas para personalizar seu atendimento',
    description: 'Precisamos conhecer melhor sua empresa para configurar tudo corretamente.',
    component: 'BusinessInfoStep'
  },
  {
    id: 'whatsapp-number',
    title: 'Número do WhatsApp',
    subtitle: 'Escolha como quer usar o WhatsApp',
    description: 'Vamos decidir qual número usar para seu atendimento automatizado.',
    component: 'WhatsAppNumberStep'
  },
  {
    id: 'meta-business',
    title: 'Meta Business',
    subtitle: 'Configuração da conta empresarial',
    description: 'Precisamos conectar com o Meta Business para funcionar oficialmente.',
    component: 'MetaBusinessStep'
  },
  {
    id: 'automation-setup',
    title: 'Configuração da Automação',
    subtitle: 'Como você quer que funcione',
    description: 'Vamos configurar as primeiras automações do seu atendimento.',
    component: 'AutomationSetupStep'
  },
  {
    id: 'subscription',
    title: 'Escolha seu Plano',
    subtitle: '7 dias grátis para testar tudo',
    description: 'Comece com nosso teste gratuito de 7 dias, depois escolha o plano ideal.',
    component: 'SubscriptionStep'
  }
];

// Componente FAQ reutilizável
const FAQ = ({ faqs, title = "Dúvidas frequentes" }) => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="mt-8 border-t pt-6">
      <h4 className="text-sm font-medium text-gray-900 mb-4">{title}</h4>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-gray-200 rounded-lg">
            <button
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
              className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-gray-50"
            >
              <span className="text-sm font-medium text-gray-700">{faq.question}</span>
              <svg 
                className={`h-4 w-4 text-gray-500 transition-transform ${openFaq === index ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openFaq === index && (
              <div className="px-4 pb-3">
                <p className="text-sm text-gray-600">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente de boas-vindas atualizado
const WelcomeStep = ({ onNext }) => {
  const faqs = [
    {
      question: "O que é automação do WhatsApp?",
      answer: "É como ter um assistente virtual que responde seus clientes automaticamente no WhatsApp, 24 horas por dia. Ele pode responder perguntas básicas, agendar horários, enviar catálogos e muito mais."
    },
    {
      question: "Meus clientes vão saber que é um robô?",
      answer: "Você pode configurar para ser transparente ou mais natural. O importante é que seus clientes recebam respostas rápidas e úteis. Quando necessário, eles sempre podem falar com uma pessoa real."
    },
    {
      question: "É difícil de configurar?",
      answer: "Não! Vamos te guiar passo a passo. Você não precisa entender de tecnologia - nós cuidamos de tudo para você."
    },
    {
      question: "Quanto tempo leva para funcionar?",
      answer: "Normalmente entre 1 a 3 dias úteis, dependendo da configuração que você escolher. Vamos te avisar quando estiver tudo pronto."
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-lime-100">
          <svg className="h-8 w-8 text-lime-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.479 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-2.462-.96-4.779-2.705-6.526-1.747-1.746-4.066-2.711-6.533-2.713-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.099-.634zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.510l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Vamos automatizar seu WhatsApp!
          </h3>
          <p className="text-gray-600 mt-2">
            Você está a poucos passos de ter um atendimento automático que funciona 24 horas por dia, 
            responde seus clientes na hora e ainda aumenta suas vendas.
          </p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-green-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-green-700">
              <p className="font-medium">Este processo pode levar alguns dias</p>
              <p>Você pode pausar e continuar quando quiser. Vamos salvar tudo automaticamente!</p>
            </div>
          </div>
        </div>
      </div>
      
      <button
        onClick={onNext}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        style={{ backgroundColor: '#25d366' }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#1da651'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#25d366'}
      >
        Vamos começar! 🚀
      </button>
      
      <FAQ faqs={faqs} />
    </div>
  );
};

// Componente de informações da empresa
const BusinessInfoStep = ({ onNext, onBack }) => {
  const [businessInfo, setBusinessInfo] = useState({
    companyName: '',
    businessType: '',
    monthlyCustomers: '',
    currentWhatsApp: '',
    mainGoal: ''
  });

  const businessTypes = [
    'Loja física', 'E-commerce', 'Prestação de serviços', 'Consultoria',
    'Clínica/Estética', 'Restaurante', 'Academia', 'Outro'
  ];

  const customerRanges = [
    'Até 50 por mês', '50-200 por mês', '200-500 por mês', 
    '500-1000 por mês', 'Mais de 1000 por mês'
  ];

  const goals = [
    'Responder mais rápido', 'Vender mais', 'Reduzir trabalho manual',
    'Atender fora do horário', 'Organizar melhor os atendimentos'
  ];

  const faqs = [
    {
      question: "Por que vocês precisam dessas informações?",
      answer: "Para configurar seu atendimento do jeito certo! Cada tipo de negócio tem necessidades diferentes. Uma loja precisa de catálogo, uma clínica precisa de agendamento, etc."
    },
    {
      question: "Posso mudar essas informações depois?",
      answer: "Claro! Você pode alterar tudo a qualquer momento no painel de controle. Essas informações são só para começarmos na direção certa."
    },
    {
      question: "Meus dados ficam seguros?",
      answer: "Absolutamente! Usamos as mesmas tecnologias de segurança dos bancos. Seus dados nunca são compartilhados com terceiros."
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await fetch('/api/onboarding/business-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(businessInfo)
      });
      onNext();
    } catch (error) {
      console.error('Erro ao salvar informações da empresa:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
            Nome da sua empresa *
          </label>
          <input
            type="text"
            id="companyName"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            value={businessInfo.companyName}
            onChange={(e) => setBusinessInfo({ ...businessInfo, companyName: e.target.value })}
            placeholder="Ex: Loja da Maria, Clínica Beleza, etc."
          />
        </div>
        
        <div>
          <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
            Que tipo de negócio você tem? *
          </label>
          <select
            id="businessType"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            value={businessInfo.businessType}
            onChange={(e) => setBusinessInfo({ ...businessInfo, businessType: e.target.value })}
          >
            <option value="">Selecione uma opção</option>
            {businessTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="monthlyCustomers" className="block text-sm font-medium text-gray-700 mb-2">
            Quantos clientes você atende por mês no WhatsApp? *
          </label>
          <select
            id="monthlyCustomers"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            value={businessInfo.monthlyCustomers}
            onChange={(e) => setBusinessInfo({ ...businessInfo, monthlyCustomers: e.target.value })}
          >
            <option value="">Selecione uma faixa</option>
            {customerRanges.map(range => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="currentWhatsApp" className="block text-sm font-medium text-gray-700 mb-2">
            Qual número você usa hoje para atendimento?
          </label>
          <input
            type="tel"
            id="currentWhatsApp"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            value={businessInfo.currentWhatsApp}
            onChange={(e) => setBusinessInfo({ ...businessInfo, currentWhatsApp: e.target.value })}
            placeholder="(11) 99999-9999"
          />
          <p className="text-xs text-gray-500 mt-1">
            Pode deixar em branco se ainda não tem um número específico
          </p>
        </div>
        
        <div>
          <label htmlFor="mainGoal" className="block text-sm font-medium text-gray-700 mb-2">
            Qual seu principal objetivo? *
          </label>
          <select
            id="mainGoal"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            value={businessInfo.mainGoal}
            onChange={(e) => setBusinessInfo({ ...businessInfo, mainGoal: e.target.value })}
          >
            <option value="">Selecione seu objetivo</option>
            {goals.map(goal => (
              <option key={goal} value={goal}>{goal}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Voltar
        </button>
        <button
          type="submit"
          className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          style={{ backgroundColor: '#25d366' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#1da651'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#25d366'}
        >
          Continuar
        </button>
      </div>
      
      <FAQ faqs={faqs} />
    </form>
  );
};

// Componente de escolha do número do WhatsApp
const WhatsAppNumberStep = ({ onNext, onBack }) => {
  const [numberChoice, setNumberChoice] = useState('');
  const [purchaseChoice, setPurchaseChoice] = useState('');
  
  const faqs = [
    {
      question: "Qual a diferença entre usar meu número atual e um número novo?",
      answer: "Com seu número atual: Seus clientes já conhecem, mas teremos limitações técnicas (não usamos a API oficial do WhatsApp). Com número novo: Funciona com todas as funcionalidades oficiais, mas você precisará avisar seus clientes sobre o novo número."
    },
    {
      question: "Por que o número atual não pode usar a API oficial?",
      answer: "O WhatsApp só permite que números novos sejam conectados à API oficial do Meta Business. Números que já usam WhatsApp normal não podem ser migrados. É uma regra do próprio WhatsApp."
    },
    {
      question: "Como meus clientes vão saber do número novo?",
      answer: "Te ajudamos a fazer a transição! Criamos mensagens automáticas no seu número atual direcionando para o novo, posts para redes sociais e um plano de comunicação."
    },
    {
      question: "Quanto custa um número novo?",
      answer: "Números nacionais custam em média R$ 50-80/mês. Podemos incluir na sua fatura ou você pode comprar diretamente. Te mostraremos todas as opções disponíveis."
    },
    {
      question: "Posso escolher o número?",
      answer: "Sim! Você pode escolher entre números disponíveis na sua região ou com terminações específicas (quando disponível)."
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!numberChoice) {
      alert('Por favor, escolha uma opção para o número do WhatsApp');
      return;
    }

    if (numberChoice === 'new' && !purchaseChoice) {
      alert('Por favor, escolha como quer adquirir o número novo');
      return;
    }
    
    try {
      await fetch('/api/onboarding/whatsapp-number', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ numberChoice, purchaseChoice })
      });
      onNext();
    } catch (error) {
      console.error('Erro ao salvar escolha do número:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Como você quer usar o WhatsApp?
          </h4>
          
          <div className="space-y-4">
            <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="numberChoice"
                  value="current"
                  checked={numberChoice === 'current'}
                  onChange={(e) => setNumberChoice(e.target.value)}
                  className="mt-1 text-green-600"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">Usar meu número atual</span>
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                      Limitações
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Mantenho o número que meus clientes já conhecem
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-3">
                    <p className="text-sm text-yellow-800">
                      <strong>⚠️ Importante:</strong> Não poderemos usar a API oficial do WhatsApp. 
                      Algumas funcionalidades avançadas podem não estar disponíveis.
                    </p>
                  </div>
                </div>
              </label>
            </div>
            
            <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="numberChoice"
                  value="new"
                  checked={numberChoice === 'new'}
                  onChange={(e) => setNumberChoice(e.target.value)}
                  className="mt-1 text-green-600"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">Quero um número novo</span>
                    <span className="bg-lime-100 text-lime-800 text-xs px-2 py-1 rounded-full">
                      Recomendado
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Número profissional com todas as funcionalidades oficiais
                  </p>
                  <div className="bg-lime-50 border border-lime-200 rounded-md p-3 mt-3">
                    <p className="text-sm text-lime-800">
                      <strong>✅ Vantagens:</strong> API oficial, todas as funcionalidades, 
                      relatórios completos, integração total com Meta Business.
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {numberChoice === 'new' && (
          <div className="border-t pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Como quer adquirir o número?
            </h4>
            
            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="purchaseChoice"
                  value="we-buy"
                  checked={purchaseChoice === 'we-buy'}
                  onChange={(e) => setPurchaseChoice(e.target.value)}
                  className="mt-1 text-green-600"
                />
                <div>
                  <span className="font-medium text-gray-900">Vocês compram para mim</span>
                  <p className="text-sm text-gray-600">
                    Nós cuidamos de tudo e incluímos o valor na sua fatura mensal. 
                    Mais prático e sem burocracia.
                  </p>
                </div>
              </label>
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="purchaseChoice"
                  value="client-buys"
                  checked={purchaseChoice === 'client-buys'}
                  onChange={(e) => setPurchaseChoice(e.target.value)}
                  className="mt-1 text-green-600"
                />
                <div>
                  <span className="font-medium text-gray-900">Eu mesmo compro</span>
                  <p className="text-sm text-gray-600">
                    Você escolhe e compra o número diretamente com a operadora. 
                    Te ajudamos com todo o processo.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Voltar
        </button>
        <button
          type="submit"
          className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          style={{ backgroundColor: '#25d366' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#1da651'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#25d366'}
        >
          Continuar
        </button>
      </div>
      
      <FAQ faqs={faqs} />
    </form>
  );
};

// Componente Meta Business
const MetaBusinessStep = ({ onNext, onBack }) => {
  const [metaBusinessInfo, setMetaBusinessInfo] = useState({
    knowsMetaBusiness: '',
    hasMetaBusiness: '',
    whoManages: '',
    needsHelp: true
  });
  
  const faqs = [
    {
      question: "O que é o Meta Business?",
      answer: "É a plataforma oficial do Facebook (Meta) para empresas. É onde você gerencia anúncios do Facebook/Instagram e também onde conectamos seu WhatsApp Business. É gratuito e obrigatório para usar o WhatsApp oficialmente."
    },
    {
      question: "Eu preciso ter Facebook para isso?",
      answer: "Sim, mas é muito simples! Se você não tem, criamos uma conta básica só para isso. Você não precisa usar o Facebook socialmente, é só para conectar o WhatsApp Business."
    },
    {
      question: "Vocês vão mexer na minha conta do Facebook?",
      answer: "Nunca! Só ajudamos você a fazer as configurações necessárias. Você mantém total controle da sua conta. Nós só ensinamos e orientamos."
    },
    {
      question: "E se eu já tenho uma agência cuidando disso?",
      answer: "Perfeito! Vamos trabalhar junto com sua agência. Eles provavelmente já sabem como fazer essa configuração. Podemos até dar suporte técnico para eles."
    },
    {
      question: "Isso vai afetar meus anúncios atuais?",
      answer: "Não! O WhatsApp Business é configurado separadamente. Seus anúncios continuam funcionando normalmente. Na verdade, depois você pode até integrar tudo para vender mais!"
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!metaBusinessInfo.knowsMetaBusiness) {
      alert('Por favor, nos diga se você conhece o Meta Business');
      return;
    }
    
    try {
      await fetch('/api/onboarding/meta-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(metaBusinessInfo)
      });
      onNext();
    } catch (error) {
      console.error('Erro ao salvar informações do Meta Business:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-blue-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-700">
              <p className="font-medium">Por que precisamos do Meta Business?</p>
              <p>É a única forma oficial de conectar o WhatsApp para empresas. Sem ele, não conseguimos ativar as funcionalidades profissionais.</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Você conhece o Meta Business (antigo Facebook Business)?
          </h4>
          
          <div className="space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="knowsMetaBusiness"
                value="yes-use"
                checked={metaBusinessInfo.knowsMetaBusiness === 'yes-use'}
                onChange={(e) => setMetaBusinessInfo({ ...metaBusinessInfo, knowsMetaBusiness: e.target.value })}
                className="mt-1 text-green-600"
              />
              <div>
                <span className="font-medium text-gray-900">Sim, eu uso para anúncios do Facebook/Instagram</span>
                <p className="text-sm text-gray-600">Já tenho conta e sei como funciona</p>
              </div>
            </label>
            
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="knowsMetaBusiness"
                value="yes-know"
                checked={metaBusinessInfo.knowsMetaBusiness === 'yes-know'}
                onChange={(e) => setMetaBusinessInfo({ ...metaBusinessInfo, knowsMetaBusiness: e.target.value })}
                className="mt-1 text-green-600"
              />
              <div>
                <span className="font-medium text-gray-900">Já ouvi falar, mas nunca usei</span>
                <p className="text-sm text-gray-600">Sei que existe mas preciso de ajuda</p>
              </div>
            </label>
            
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="knowsMetaBusiness"
                value="no"
                checked={metaBusinessInfo.knowsMetaBusiness === 'no'}
                onChange={(e) => setMetaBusinessInfo({ ...metaBusinessInfo, knowsMetaBusiness: e.target.value })}
                className="mt-1 text-green-600"
              />
              <div>
                <span className="font-medium text-gray-900">Não, nunca ouvi falar</span>
                <p className="text-sm text-gray-600">Preciso que vocês me expliquem tudo</p>
              </div>
            </label>
          </div>
        </div>

        {(metaBusinessInfo.knowsMetaBusiness === 'yes-use' || metaBusinessInfo.knowsMetaBusiness === 'yes-know') && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Quem cuida do Meta Business da sua empresa?
            </h4>
            
            <div className="space-y-3">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="whoManages"
                  value="myself"
                  checked={metaBusinessInfo.whoManages === 'myself'}
                  onChange={(e) => setMetaBusinessInfo({ ...metaBusinessInfo, whoManages: e.target.value })}
                  className="mt-1 text-green-600"
                />
                <div>
                  <span className="font-medium text-gray-900">Eu mesmo cuido</span>
                  <p className="text-sm text-gray-600">Tenho acesso e sei mexer</p>
                </div>
              </label>
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="whoManages"
                  value="employee"
                  checked={metaBusinessInfo.whoManages === 'employee'}
                  onChange={(e) => setMetaBusinessInfo({ ...metaBusinessInfo, whoManages: e.target.value })}
                  className="mt-1 text-green-600"
                />
                <div>
                  <span className="font-medium text-gray-900">Um funcionário da empresa</span>
                  <p className="text-sm text-gray-600">Tenho alguém da equipe que mexe nisso</p>
                </div>
              </label>
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="whoManages"
                  value="agency"
                  checked={metaBusinessInfo.whoManages === 'agency'}
                  onChange={(e) => setMetaBusinessInfo({ ...metaBusinessInfo, whoManages: e.target.value })}
                  className="mt-1 text-green-600"
                />
                <div>
                  <span className="font-medium text-gray-900">Uma agência/freelancer</span>
                  <p className="text-sm text-gray-600">Terceirizei essa parte</p>
                </div>
              </label>
              
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="whoManages"
                  value="not-sure"
                  checked={metaBusinessInfo.whoManages === 'not-sure'}
                  onChange={(e) => setMetaBusinessInfo({ ...metaBusinessInfo, whoManages: e.target.value })}
                  className="mt-1 text-green-600"
                />
                <div>
                  <span className="font-medium text-gray-900">Não tenho certeza</span>
                  <p className="text-sm text-gray-600">Preciso verificar quem tem acesso</p>
                </div>
              </label>
            </div>
          </div>
        )}

        <div className="bg-lime-50 border border-lime-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-lime-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-lime-700">
              <p className="font-medium">Relaxe, nós ajudamos!</p>
              <p>Independente da sua situação, nosso time te acompanha em cada passo. Você não vai ficar perdido!</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Voltar
        </button>
                <button
          type="submit"
          className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          style={{ backgroundColor: '#25d366' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#1da651'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#25d366'}
        >
          Continuar
        </button>
      </div>
      
      <FAQ faqs={faqs} />
    </form>
  );
};

// Componente de configuração da automação

// Componente de configuração da automação
const AutomationSetupStep = ({ onNext, onBack }) => {
  const [automationConfig, setAutomationConfig] = useState({
    businessHours: 'business',
    welcomeMessage: true,
    autoResponses: true,
    humanHandoff: true,
    notifications: true
  });
  
  const [isCompleting, setIsCompleting] = useState(false);
  const router = useRouter();
  
  const faqs = [
    {
      question: "Como funciona o atendimento fora do horário?",
      answer: "Você pode configurar uma mensagem automática informando seu horário de funcionamento e que responderá no próximo dia útil. Ou deixar o robô respondendo sempre."
    },
    {
      question: "O que acontece quando o robô não sabe responder?",
      answer: "Ele transfere para um humano automaticamente! Você recebe uma notificação e pode assumir a conversa. O cliente nem percebe a mudança."
    },
    {
      question: "Posso mudar essas configurações depois?",
      answer: "Claro! Tudo pode ser ajustado no painel de controle. Estas são só as configurações iniciais para começarmos."
    },
    {
      question: "Quando meu WhatsApp vai estar funcionando?",
      answer: "Após completar este processo, nossa equipe técnica faz a configuração final. Geralmente leva de 1 a 3 dias úteis. Te avisamos por email quando estiver pronto!"
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCompleting(true);
    
    try {
      // Salvar configurações da automação
      await fetch('/api/onboarding/automation-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(automationConfig)
      });
      
      // Completar onboarding
      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Redirecionar para dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      setIsCompleting(false);
    }
  };

  if (isCompleting) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-lime-100">
          <svg className="h-8 w-8 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Parabéns! 🎉</h3>
          <p className="text-gray-600 mt-2">
            Configuração concluída com sucesso!
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Nossa equipe começará a configurar seu WhatsApp automatizado. 
            Você receberá um email com os próximos passos.
          </p>
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="text-sm text-gray-500">Redirecionando para o dashboard...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Como quer que funcione o atendimento?
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quando o robô deve responder?
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="businessHours"
                    value="always"
                    checked={automationConfig.businessHours === 'always'}
                    onChange={(e) => setAutomationConfig({ ...automationConfig, businessHours: e.target.value })}
                    className="text-green-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">24 horas por dia, 7 dias por semana</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="businessHours"
                    value="business"
                    checked={automationConfig.businessHours === 'business'}
                    onChange={(e) => setAutomationConfig({ ...automationConfig, businessHours: e.target.value })}
                    className="text-green-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">Apenas no horário comercial (configuraremos depois)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">
            Funcionalidades que quer ativar:
          </h4>
          
          <div className="space-y-3">
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={automationConfig.welcomeMessage}
                onChange={(e) => setAutomationConfig({ ...automationConfig, welcomeMessage: e.target.checked })}
                className="mt-1 text-green-600"
              />
              <div>
                <span className="font-medium text-gray-900">Mensagem de boas-vindas</span>
                <p className="text-sm text-gray-600">Cumprimentar automaticamente novos clientes</p>
              </div>
            </label>
            
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={automationConfig.autoResponses}
                onChange={(e) => setAutomationConfig({ ...automationConfig, autoResponses: e.target.checked })}
                className="mt-1 text-green-600"
              />
              <div>
                <span className="font-medium text-gray-900">Respostas automáticas</span>
                <p className="text-sm text-gray-600">Responder perguntas frequentes automaticamente</p>
              </div>
            </label>
            
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={automationConfig.humanHandoff}
                onChange={(e) => setAutomationConfig({ ...automationConfig, humanHandoff: e.target.checked })}
                className="mt-1 text-green-600"
              />
              <div>
                <span className="font-medium text-gray-900">Transferência para humano</span>
                <p className="text-sm text-gray-600">Passar para atendente quando necessário</p>
              </div>
            </label>
            
            <label className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={automationConfig.notifications}
                onChange={(e) => setAutomationConfig({ ...automationConfig, notifications: e.target.checked })}
                className="mt-1 text-green-600"
              />
              <div>
                <span className="font-medium text-gray-900">Notificações</span>
                <p className="text-sm text-gray-600">Receber avisos de novas mensagens e transferências</p>
              </div>
            </label>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-green-600 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-green-700">
              <p className="font-medium">Próximos passos:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Nossa equipe vai configurar tudo para você</li>
                <li>Você receberá um email com instruções</li>
                <li>Em 1-3 dias úteis seu WhatsApp estará automatizado</li>
                <li>Te ajudamos com os primeiros testes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Voltar
        </button>
        <button
          type="submit"
          className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-lime-600 hover:bg-lime-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500"
        >
          Finalizar Configuração! 🚀
        </button>
      </div>
      
      <FAQ faqs={faqs} />
    </form>
  );
};

// Componente de assinatura com Stripe
const SubscriptionStep = ({ onNext, onBack }) => {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('starter');
  const [isLoading, setIsLoading] = useState(false);
  const stripeEnabled = isStripeEnabled();
  if (typeof window !== 'undefined') {
    console.log('[SubscriptionStep] render', { stripeEnabled, selectedPlan });
  }

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 'R$ 97',
      period: '/mês',
      description: 'Perfeito para pequenos negócios',
      features: [
        'Até 1.000 mensagens/mês',
        'Respostas automáticas',
        'Chatbot básico',
        'Suporte por email',
        'Relatórios básicos'
      ],
      recommended: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 'R$ 197',
      period: '/mês',
      description: 'Ideal para empresas em crescimento',
      features: [
        'Até 5.000 mensagens/mês',
        'Chatbot avançado',
        'Integração com CRM',
        'Suporte prioritário',
        'Relatórios avançados',
        'Múltiplos números',
        'API personalizada'
      ],
      recommended: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'R$ 397',
      period: '/mês',
      description: 'Solução completa para grandes empresas',
      features: [
        'Mensagens ilimitadas',
        'Chatbot com IA',
        'Integração completa',
        'Suporte 24/7',
        'Dashboard personalizado',
        'Múltiplas equipes',
        'White label'
      ],
      recommended: false
    }
  ];

  const handlePlanSelect = async (planId) => {
    setSelectedPlan(planId);
  };

  const handleStartTrial = async () => {
    let shouldResetLoading = true;
    setIsLoading(true);
    
    try {
      console.log('[SubscriptionStep] handleStartTrial:start', { stripeEnabled, selectedPlan });
      // Verificar se Stripe está habilitado
  if (!stripeEnabled) {
        // OPÇÃO 1: Trial gratuito sem cartão (modo mock)
        const response = await fetch('/api/subscription/start-trial', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            planId: selectedPlan
          })
        });

        if (response.ok) {
          console.log('[SubscriptionStep] start-trial success (mock)');
          onNext();
        } else {
          console.error('[SubscriptionStep] start-trial failed (mock)', response.status);
          throw new Error('Erro ao iniciar teste');
        }
      } else {
        // OPÇÃO 2: Redirecionar para página de pagamento com Stripe
        const token = localStorage.getItem('token');

        console.log('[SubscriptionStep] Stripe ativo, preparando redirect', { tokenPresent: Boolean(token) });

        if (!token) {
          router.push('/login');
          shouldResetLoading = false;
          return;
        }

        console.log('[SubscriptionStep] redirecting to payment', { planId: selectedPlan });
        router.push(`/payment/${selectedPlan}`);
        shouldResetLoading = false;
        return;
      }

    } catch (error) {
      console.error('Erro ao iniciar trial:', error);
      alert('Erro ao iniciar teste. Tente novamente.');
    } finally {
      if (shouldResetLoading) {
        setIsLoading(false);
      }
    }
  };

  const faqs = [
    {
      question: "Como funciona o teste grátis de 7 dias?",
      answer: "Você tem acesso completo a todas as funcionalidades do plano escolhido por 7 dias. Não cobramos nada neste período e você pode cancelar a qualquer momento."
    },
    {
      question: "Preciso cadastrar cartão de crédito?",
      answer: stripeEnabled 
        ? "Sim, pedimos um cartão para garantir continuidade após o período de teste, mas só cobramos após os 7 dias se você não cancelar."
        : "Não! Nosso teste é completamente gratuito, sem necessidade de cartão de crédito. Você pode testar todas as funcionalidades sem compromisso."
    },
    {
      question: "Posso mudar de plano depois?",
      answer: "Sim! Você pode mudar seu plano a qualquer momento através do dashboard. As mudanças são aplicadas no próximo ciclo."
    },
    {
      question: "E se eu quiser cancelar?",
      answer: "Sem problemas! Cancele a qualquer momento sem taxa de cancelamento. Seus dados ficam seguros por 30 dias caso queira reativar."
    }
  ];

  return (
    <div className="space-y-8">
      {/* Badge de teste grátis */}
      <div className="text-center">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 border border-green-200">
          <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-green-800 font-medium">7 dias grátis • Sem compromisso</span>
        </div>
      </div>

      {/* Grid de planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => handlePlanSelect(plan.id)}
            className={`relative text-left border-2 rounded-lg p-6 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 ${
              selectedPlan === plan.id
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${plan.recommended ? 'ring-2 ring-green-500' : ''}`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Recomendado
                </span>
              </div>
            )}

            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
              <p className="text-gray-600 text-sm">{plan.description}</p>
            </div>

            <div className="text-center mb-6">
              <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
              <span className="text-gray-600">{plan.period}</span>
              <div className="text-sm text-green-600 font-medium mt-1">
                Primeiro mês: <span className="line-through text-gray-400">{plan.price}</span> GRÁTIS
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="text-center">
              <div className={`w-6 h-6 rounded-full border-2 mx-auto ${
                selectedPlan === plan.id
                  ? 'bg-green-500 border-green-500'
                  : 'border-gray-300'
              }`}>
                {selectedPlan === plan.id && (
                  <svg className="w-4 h-4 text-white m-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Garantias */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-medium text-blue-900">Garantias do seu teste grátis:</h4>
            <ul className="text-sm text-blue-800 mt-2 space-y-1">
              <li>• 7 dias completamente grátis</li>
              <li>• Cancele a qualquer momento sem custo</li>
              <li>• Suporte gratuito durante o teste</li>
              <li>• Sem taxas de configuração</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Botões */}
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Voltar
        </button>
        <button
          onClick={handleStartTrial}
          disabled={isLoading}
          className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          style={{ backgroundColor: '#25d366' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#1da651'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#25d366'}
        >
          {isLoading ? 'Iniciando teste...' : 'Começar teste grátis de 7 dias 🚀'}
        </button>
      </div>
      
      <FAQ faqs={faqs} title="Dúvidas sobre planos e teste grátis" />
    </div>
  );
};

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const forcedStepId = searchParams.get('step');
  const forcedStepIndex = forcedStepId
    ? ONBOARDING_STEPS.findIndex((step) => step.id === forcedStepId)
    : -1;
  const hasForcedStep = forcedStepIndex >= 0;

  useEffect(() => {
    // Verificar se usuário está logado
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Carregar progresso do onboarding
    const loadOnboardingProgress = async () => {
      try {
        const response = await fetch('/api/onboarding/progress', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.status === 401) {
          router.push('/login');
          return;
        }

        const data = await response.json();

        if (hasForcedStep) {
          const preCompleted = Array.from({ length: forcedStepIndex }, (_, idx) => idx);
          setCompletedSteps(preCompleted);
          setCurrentStep(forcedStepIndex);
          return;
        }

        if (data.completed) {
          router.push('/dashboard');
        } else {
          setCurrentStep(data.currentStep || 0);
          setCompletedSteps(data.completedSteps || []);
        }
      } catch (error) {
        console.error('Erro ao carregar progresso:', error);
      }
    };

    loadOnboardingProgress();
  }, [router, hasForcedStep, forcedStepIndex]);

  const goToNext = () => {
    const newCompletedSteps = [...completedSteps, currentStep];
    setCompletedSteps(newCompletedSteps);
    
    // Se é o último step (SubscriptionStep), redirecionar para dashboard
    if (currentStep === ONBOARDING_STEPS.length - 1) {
      // Completar onboarding e redirecionar
      completeOnboarding();
    } else if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      // Marcar onboarding como completo
      await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Redirecionar para dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
    }
  };

  const goToPrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentStepData = ONBOARDING_STEPS[currentStep];

  const renderStepComponent = () => {
    switch (currentStepData.component) {
      case 'WelcomeStep':
        return <WelcomeStep onNext={goToNext} />;
      case 'BusinessInfoStep':
        return <BusinessInfoStep onNext={goToNext} onBack={goToPrevious} />;
      case 'WhatsAppNumberStep':
        return <WhatsAppNumberStep onNext={goToNext} onBack={goToPrevious} />;
      case 'MetaBusinessStep':
        return <MetaBusinessStep onNext={goToNext} onBack={goToPrevious} />;
      case 'AutomationSetupStep':
        return <AutomationSetupStep onNext={goToNext} onBack={goToPrevious} />;
      case 'SubscriptionStep':
        return <SubscriptionStep onNext={goToNext} onBack={goToPrevious} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Configuração da conta</h1>
          <p className="mt-2 text-sm text-gray-600">
            Passo {currentStep + 1} de {ONBOARDING_STEPS.length}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentStep + 1) / ONBOARDING_STEPS.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-lg shadow px-6 py-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {currentStepData.title}
            </h2>
            {currentStepData.subtitle && (
              <p className="text-sm font-medium text-green-600 mb-2">
                {currentStepData.subtitle}
              </p>
            )}
            <p className="text-sm text-gray-600">
              {currentStepData.description}
            </p>
          </div>
          
          {renderStepComponent()}
        </div>

        {/* Skip option */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Pular por agora (continuar mais tarde)
          </button>
        </div>
      </div>
    </div>
  );
}