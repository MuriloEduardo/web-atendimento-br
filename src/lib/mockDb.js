// Mock database para simular um banco de dados
// Em produção, isso seria substituído por uma conexão real com banco de dados

class MockDatabase {
  constructor() {
    this.users = new Map();
    this.subscriptions = new Map();
    this.nextUserId = 1;
    this.nextSubscriptionId = 1;
  }

  // Métodos para usuários
  createUser(userData) {
    const user = {
      id: this.nextUserId++,
      ...userData,
      createdAt: new Date().toISOString()
    };
    this.users.set(user.id, user);
    return user;
  }

  getUserById(id) {
    return this.users.get(id);
  }

  getUserByEmail(email) {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  updateUser(id, updates) {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, ...updates };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return null;
  }

  getAllUsers() {
    return Array.from(this.users.values());
  }

  // Métodos para assinaturas
  createSubscription(subscriptionData) {
    const subscription = {
      id: this.nextSubscriptionId++,
      ...subscriptionData,
      createdAt: new Date().toISOString()
    };
    this.subscriptions.set(subscription.id, subscription);
    return subscription;
  }

  getSubscriptionById(id) {
    return this.subscriptions.get(id);
  }

  getSubscriptionByUserId(userId) {
    return Array.from(this.subscriptions.values()).find(
      sub => sub.userId === userId && ['active', 'trialing'].includes(sub.status)
    );
  }

  updateSubscription(id, updates) {
    const subscription = this.subscriptions.get(id);
    if (subscription) {
      const updatedSubscription = { ...subscription, ...updates };
      this.subscriptions.set(id, updatedSubscription);
      return updatedSubscription;
    }
    return null;
  }

  getAllSubscriptions() {
    return Array.from(this.subscriptions.values());
  }

  // Utilitário para extrair usuário do token
  getUserFromToken(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    // Extrair ID do usuário do token mock
    const parts = token.split('_');
    if (parts.length >= 3 && parts[0] === 'mock' && parts[1] === 'token') {
      const userId = parseInt(parts[2]);
      return this.getUserById(userId);
    }
    
    return null;
  }
}

// Instância única do banco de dados mock
const db = new MockDatabase();

export default db;