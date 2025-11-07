import fs from 'fs';
import path from 'path';

// Mock database para simular um banco de dados
// Em produção, isso seria substituído por uma conexão real com banco de dados

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE_PATH = path.join(DATA_DIR, 'mockDb.json');

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readPersistedData() {
  try {
    ensureDataDirectory();

    if (!fs.existsSync(DATA_FILE_PATH)) {
      const emptyPayload = { users: [], subscriptions: [] };
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(emptyPayload, null, 2), 'utf-8');
      return emptyPayload;
    }

    const raw = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
    if (!raw.trim()) {
      return { users: [], subscriptions: [] };
    }

    const parsed = JSON.parse(raw);
    const users = Array.isArray(parsed.users) ? parsed.users : [];
    const subscriptions = Array.isArray(parsed.subscriptions) ? parsed.subscriptions : [];

    return { users, subscriptions };
  } catch (error) {
    console.error('Erro ao carregar dados do mockDb:', error);
    return { users: [], subscriptions: [] };
  }
}

function writePersistedData(data) {
  try {
    ensureDataDirectory();
    const payload = {
      users: Array.isArray(data.users) ? data.users : [],
      subscriptions: Array.isArray(data.subscriptions) ? data.subscriptions : []
    };

    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (error) {
    console.error('Erro ao salvar dados do mockDb:', error);
  }
}

class MockDatabase {
  constructor() {
    const persistedData = readPersistedData();

    const normalizedUsers = persistedData.users.map((user) => {
      const numericId = Number(user.id);
      return {
        ...user,
        id: Number.isFinite(numericId) ? numericId : user.id,
        subscriptionActive: typeof user.subscriptionActive === 'boolean' ? user.subscriptionActive : false
      };
    });

    const normalizedSubscriptions = persistedData.subscriptions.map((subscription) => {
      const numericId = Number(subscription.id);
      return {
        ...subscription,
        id: Number.isFinite(numericId) ? numericId : subscription.id
      };
    });

    this.users = new Map(normalizedUsers.map((user) => [user.id, user]));
    this.subscriptions = new Map(
      normalizedSubscriptions.map((subscription) => [subscription.id, subscription])
    );

    const highestUserId = normalizedUsers.reduce((maxId, user) => {
      const numericId = Number(user.id);
      return Number.isFinite(numericId) ? Math.max(maxId, numericId) : maxId;
    }, 0);

    const highestSubscriptionId = normalizedSubscriptions.reduce((maxId, subscription) => {
      const numericId = Number(subscription.id);
      return Number.isFinite(numericId) ? Math.max(maxId, numericId) : maxId;
    }, 0);

    this.nextUserId = highestUserId + 1 || 1;
    this.nextSubscriptionId = highestSubscriptionId + 1 || 1;
  }

  persist() {
    writePersistedData({
      users: Array.from(this.users.values()),
      subscriptions: Array.from(this.subscriptions.values())
    });
  }

  // Métodos para usuários
  createUser(userData) {
    const user = {
      id: this.nextUserId++,
      ...userData,
      createdAt: new Date().toISOString(),
      subscriptionActive: false
    };
    this.users.set(user.id, user);
    this.persist();
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
      this.persist();
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
    this.persist();
    return subscription;
  }

  getSubscriptionById(id) {
    return this.subscriptions.get(id);
  }

  getSubscriptionByUserId(userId) {
    return Array.from(this.subscriptions.values()).find(
      sub => sub.userId === userId
    );
  }

  getSubscriptionByStripeId(stripeSubscriptionId) {
    if (!stripeSubscriptionId) {
      return null;
    }

    return Array.from(this.subscriptions.values()).find(
      sub => sub.stripeSubscriptionId === stripeSubscriptionId
    );
  }

  getUserByStripeCustomerId(stripeCustomerId) {
    if (!stripeCustomerId) {
      return null;
    }

    return Array.from(this.users.values()).find(
      user => user.stripeCustomerId === stripeCustomerId
    );
  }

  updateSubscription(id, updates) {
    const subscription = this.subscriptions.get(id);
    if (subscription) {
      const updatedSubscription = { ...subscription, ...updates };
      this.subscriptions.set(id, updatedSubscription);
      this.persist();
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

    // Tentar verificar JWT real primeiro
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production');

      // Se JWT válido, buscar usuário pelo userId
      if (decoded && decoded.userId) {
        const user = this.getUserById(decoded.userId);
        if (user) {
          return user;
        }
      }
    } catch (jwtError) {
      // JWT inválido ou expirado, continuar com método mock
    }

    // Fallback: Extrair ID do usuário do token mock (legado)
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