# Atendimento BR - Frontend App

Uma aplicação Next.js completa para automatização de WhatsApp empresarial, com sistema de onboarding especializado para pessoas leigas em tecnologia.

## 🚀 Funcionalidades Principais

### ✨ Automação de WhatsApp
- **Atendimento 24/7** - Robô que responde seus clientes automaticamente
- **API Oficial do Meta** - Integração completa com WhatsApp Business API
- **Transferência Inteligente** - Passa para humano quando necessário
- **Mensagens Personalizadas** - Configure respostas para seu negócio

### 📱 **Páginas Implementadas:**
1. **Home** (`/`) - Landing page explicando a automação do WhatsApp
2. **Login** (`/login`) - Autenticação de usuários 
3. **Cadastro** (`/cadastro`) - Registro de novos usuários
4. **Onboarding** (`/onboarding`) - Processo de configuração especializado em WhatsApp
5. **Dashboard** (`/dashboard`) - Painel principal do usuário

## 🎯 Sistema de Onboarding Especializado

Processo de 5 etapas focado em automatização do WhatsApp, com explicações para pessoas que não entendem de tecnologia:

### 1️⃣ **Boas-vindas**
- Explicação clara do que é automação do WhatsApp
- FAQ com dúvidas básicas de pessoas leigas
- Linguagem simples e acessível

### 2️⃣ **Informações da Empresa**
- Coleta dados para personalizar o atendimento
- Tipo de negócio (loja, clínica, e-commerce, etc.)
- Volume de clientes atendidos
- Objetivo principal da automação

### 3️⃣ **Escolha do Número**
**Opções explicadas de forma clara:**
- ✅ **Número novo (Recomendado)**: Funciona com API oficial, todas as funcionalidades
- ⚠️ **Número atual**: Mantém o número conhecido, mas com limitações técnicas

**Para número novo:**
- Opção de compra pelo cliente
- Opção de compra pela empresa (incluído na fatura)
- Explicação sobre custos e processo

**FAQ específico:**
- Por que número atual não pode usar API oficial?
- Como avisar clientes sobre número novo?
- Quanto custa um número novo?

### 4️⃣ **Meta Business**
**Explicações detalhadas para leigos:**
- O que é Meta Business (antigo Facebook Business)
- Por que é obrigatório para WhatsApp empresarial
- Quem cuida dessa parte na empresa
- Impacto em anúncios existentes

**Cenários cobertos:**
- "Eu mesmo cuido dos anúncios"
- "Uma agência cuida pra mim"
- "Não sei o que é isso"
- "Nunca mexi com Facebook"

### 5️⃣ **Configuração da Automação**
- Horário de funcionamento do robô
- Funcionalidades a ativar (boas-vindas, respostas automáticas, etc.)
- Como funciona a transferência para humanos
- Próximos passos após configuração

## 🤖 FAQ Integrado

Cada etapa possui FAQ específico com dúvidas reais de empresários:
- **Linguagem simples** - Sem termos técnicos
- **Exemplos práticos** - Situações do dia a dia
- **Tranquilização** - Mostra que é simples e seguro

## 🗄️ **Backend Mockado Atualizado:**

#### Onboarding Especializado
- `POST /api/onboarding/business-info` - Informações da empresa
- `POST /api/onboarding/whatsapp-number` - Escolha do número
- `POST /api/onboarding/meta-business` - Configuração Meta Business
- `POST /api/onboarding/automation-setup` - Configuração da automação

## 🎨 **Design Focado no Usuário Leigo:**

### Elementos Visuais
- ✅ **Badges informativos** (Recomendado, Limitações, etc.)
- ⚠️ **Alertas explicativos** - Avisos importantes em linguagem clara
- 🎯 **Cards comparativos** - Opções lado a lado com prós e contras
- 📊 **Barra de progresso** - Mostra avanço no processo

### Linguagem
- **Sem jargões técnicos** - Tudo explicado em português simples
- **Exemplos práticos** - "Como ter um assistente virtual 24h"
- **Tranquilização** - "Relaxe, nós ajudamos!"
- **Emojis estratégicos** - Deixa mais amigável e menos intimidante

## 🚀 Como Testar o Onboarding

### 1. Cadastre uma conta
```
- Acesse http://localhost:3001
- Clique em "Começe agora gratuitamente"
- Preencha o cadastro
```

### 2. Teste o fluxo completo
1. **Boas-vindas**: Leia as explicações e FAQ
2. **Empresa**: Escolha tipo de negócio e objetivos
3. **Número**: Teste as duas opções (atual vs novo)
4. **Meta Business**: Simule diferentes níveis de conhecimento
5. **Automação**: Configure as funcionalidades

### 3. Observe as explicações
- Cada etapa tem linguagem específica para leigos
- FAQ contextual em cada tela
- Avisos e alertas educativos
- Próximos passos sempre claros

## 🎯 Diferencial Técnico

### Para Pessoas Leigas
- **Educação**: Ensina conceitos básicos sem assustar
- **Confiança**: Mostra que terão suporte humano
- **Simplicidade**: Processo guiado passo a passo
- **Transparência**: Explica custos e limitações

### Para Implementação
- Dados estruturados para configuração técnica
- Informações suficientes para suporte personalizado
- Flexibilidade para diferentes cenários de negócio
- Base para automação de processos internos

## 🛠️ Tecnologias

- **Next.js 16** - Framework React com App Router
- **React 19** - Biblioteca de interface
- **Tailwind CSS** - Estilização responsiva
- **API Routes** - Backend mockado integrado

## 📈 Métricas de Sucesso

O onboarding foi desenhado para:
- ✅ Reduzir desistência por complexidade técnica
- ✅ Coletar informações suficientes para configuração
- ✅ Educar o cliente sobre o produto
- ✅ Gerar confiança no processo
- ✅ Facilitar o trabalho da equipe técnica

## � Para Desenvolvedores

```bash
# Executar aplicação
npm run dev

# Acessar onboarding diretamente
http://localhost:3001/onboarding

# Testar diferentes cenários
- Usuário leigo completo
- Usuário que já usa Meta Business  
- Usuário que tem agência
- Diferentes tipos de negócio
```

## 🎯 Casos de Uso Reais

### Cenário 1: Dona de loja física
- Não entende de tecnologia
- Quer responder clientes fora do horário
- Já tem WhatsApp pessoal/comercial misturado
- **Solução**: Número novo + explicações simples

### Cenário 2: E-commerce pequeno
- Usa Instagram/Facebook para anúncios
- Agência cuida do marketing digital
- Quer automatizar perguntas sobre produtos
- **Solução**: Integração com agência existente

### Cenário 3: Prestador de serviços
- Atende por WhatsApp mas perde mensagens
- Não tem Facebook Business
- Quer apenas organizar melhor
- **Solução**: Configuração básica + educação sobre benefícios

Cada cenário é contemplado no onboarding com explicações e caminhos específicos!
