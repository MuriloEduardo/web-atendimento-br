# Atendimento BR - Frontend App

Uma aplicação Next.js completa com sistema de autenticação, onboarding e dashboard para gerenciamento de atendimento ao cliente.

## Funcionalidades

### ✨ Páginas Implementadas

- **Home Page** (`/`) - Página inicial com apresentação da plataforma
- **Login** (`/login`) - Autenticação de usuários
- **Cadastro** (`/cadastro`) - Registro de novos usuários
- **Onboarding** (`/onboarding`) - Processo de configuração inicial
- **Dashboard** (`/dashboard`) - Painel principal do usuário

### 🔐 Sistema de Autenticação

- Cadastro de usuários com validação
- Login com email e senha
- Tokens mock para simulação de autenticação
- Redirecionamento automático baseado no status do usuário

### 🚀 Sistema de Onboarding

O onboarding é um processo de múltiplas etapas que pode ser completado ao longo de vários dias:

1. **Boas-vindas** - Introdução à plataforma
2. **Perfil** - Informações da empresa (nome, telefone, website)
3. **Preferências** - Configurações de notificação
4. **Verificação** - Verificação de email (simulada)

**Características do Onboarding:**
- ✅ Pode ser interrompido e retomado a qualquer momento
- ✅ Progresso salvo automaticamente
- ✅ Usuários podem "pular por agora" e continuar depois
- ✅ Verificação de email simulada (5 segundos para demo)

### 🗄️ Backend Mockado

Todas as rotas da API são mockadas usando Next.js API Routes:

#### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/register` - Cadastro de usuário

#### Onboarding
- `GET /api/onboarding/progress` - Progresso do onboarding
- `POST /api/onboarding/profile` - Salvar perfil da empresa
- `POST /api/onboarding/preferences` - Salvar preferências
- `GET /api/onboarding/check-verification` - Verificar status do email
- `POST /api/onboarding/resend-verification` - Reenviar email de verificação
- `POST /api/onboarding/complete` - Completar onboarding

#### Usuário
- `GET /api/user/profile` - Obter dados do usuário

## 🚀 Como usar

### 1. Acesse a página inicial
Visite `http://localhost:3001` para ver a página inicial.

### 2. Criar uma conta
1. Clique em "Começe agora gratuitamente"
2. Preencha o formulário de cadastro
3. Você será automaticamente redirecionado para o onboarding

### 3. Processo de Onboarding
1. **Boas-vindas**: Clique em "Começar configuração"
2. **Perfil**: Preencha as informações da empresa (opcional)
3. **Preferências**: Configure suas notificações
4. **Verificação**: Aguarde 5 segundos e clique em "Já verifiquei"

### 4. Dashboard
Após completar o onboarding, você será redirecionado para o dashboard principal.

### 5. Login com conta existente
- Use qualquer email/senha cadastrado anteriormente
- Usuários com onboarding incompleto serão redirecionados automaticamente

## 🛠️ Tecnologias

- **Next.js 16** - Framework React com App Router
- **React 19** - Biblioteca de interface
- **Tailwind CSS** - Estilização
- **API Routes** - Backend mockado integrado

## 🎨 Design

- Interface responsiva e moderna
- Componentes reutilizáveis
- Feedback visual para ações do usuário
- Loading states e tratamento de erros

## 📝 Fluxo de Usuário

```
Home → Cadastro → Onboarding → Dashboard
  ↑      ↓
Login ←--┘
```

### Estados do Usuário

1. **Novo usuário**: Home → Cadastro → Onboarding
2. **Usuário com onboarding incompleto**: Login → Onboarding
3. **Usuário completo**: Login → Dashboard

## 🔧 Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar build de produção
npm start
```

## 📊 Dados Mockados

Os dados são armazenados em memória durante a execução. Para persistência real, implemente:

- Banco de dados (PostgreSQL, MongoDB, etc.)
- Sistema de autenticação real (NextAuth.js, Auth0, etc.)
- Verificação de email real
- Hash de senhas (bcrypt)

## 🔐 Segurança

⚠️ **IMPORTANTE**: Este é um projeto de demonstração com dados mockados. Para produção:

- Implemente hash de senhas
- Use tokens JWT reais
- Configure HTTPS
- Valide dados no servidor
- Implemente rate limiting
- Configure CORS adequadamente
