import { prisma } from './prisma';

/**
 * Atualiza o status de onboarding do usuário
 * @param {string} userId - ID do usuário
 * @param {Object} updates - Campos a atualizar
 * @returns {Promise<Object>} Usuário atualizado
 */
export async function updateOnboardingStatus(userId, updates) {
  return await prisma.user.update({
    where: { id: userId },
    data: updates,
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      businessName: true,
      businessType: true,
      website: true,
      profileComplete: true,
      onboardingComplete: true,
      subscriptionStatus: true,
      isEmailVerified: true
    }
  });
}

/**
 * Marca uma etapa do onboarding como completa
 * @param {string} userId - ID do usuário
 * @param {string} step - Nome da etapa (profile, email, subscription, etc)
 * @returns {Promise<Object>} Usuário atualizado
 */
export async function completeOnboardingStep(userId, step) {
  const updates = {};

  switch (step) {
    case 'profile':
      updates.profileComplete = true;
      break;
    case 'email_verification':
    case 'email':
      updates.isEmailVerified = true;
      break;
    case 'subscription':
      updates.subscriptionStatus = 'active';
      break;
    default:
      break;
  }

  // Verificar se todas as etapas foram completas
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      profileComplete: true,
      isEmailVerified: true,
      subscriptionStatus: true
    }
  });

  const allComplete = user.profileComplete && 
                     user.isEmailVerified && 
                     user.subscriptionStatus !== 'inactive';

  if (allComplete) {
    updates.onboardingComplete = true;
  }

  return await updateOnboardingStatus(userId, updates);
}

/**
 * Obtém o progresso do onboarding
 * @param {string} userId - ID do usuário
 * @returns {Promise<Object>} Progresso detalhado
 */
export async function getOnboardingProgress(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      onboardingComplete: true,
      profileComplete: true,
      isEmailVerified: true,
      subscriptionStatus: true
    }
  });

  if (!user) {
    return null;
  }

  const steps = [
    { name: 'profile', label: 'Perfil', completed: user.profileComplete },
    { name: 'email_verification', label: 'Verificação de Email', completed: user.isEmailVerified },
    { name: 'subscription', label: 'Assinatura', completed: user.subscriptionStatus !== 'inactive' }
  ];

  const completedSteps = steps.filter(s => s.completed).map(s => s.name);
  const currentStep = steps.findIndex(s => !s.completed);

  return {
    completed: user.onboardingComplete,
    currentStep: currentStep === -1 ? 3 : currentStep,
    completedSteps,
    steps,
    progress: Math.round((completedSteps.length / steps.length) * 100)
  };
}