import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

/**
 * Gera hash da senha usando bcryptjs
 * @param {string} password - Senha em texto plano
 * @returns {Promise<string>} Hash da senha
 */
export async function hashPassword(password) {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Compara senha em texto plano com hash
 * @param {string} password - Senha em texto plano
 * @param {string} hashedPassword - Hash da senha armazenada
 * @returns {Promise<boolean>} True se as senhas coincidirem
 */
export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword)
}

/**
 * Gera token JWT para autenticação
 * @param {Object} payload - Dados do usuário para incluir no token
 * @returns {string} Token JWT
 */
export function generateJWT(payload) {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET não está definido nas variáveis de ambiente')
  }
  
  return jwt.sign(payload, secret, { 
    expiresIn: '7d' // Token válido por 7 dias
  })
}

/**
 * Verifica e decodifica token JWT
 * @param {string} token - Token JWT
 * @returns {Object} Payload decodificado
 */
export function verifyJWT(token) {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET não está definido nas variáveis de ambiente')
  }
  
  return jwt.verify(token, secret)
}

/**
 * Gera string aleatória para tokens de verificação
 * @param {number} length - Tamanho da string
 * @returns {string} String aleatória
 */
export function generateRandomToken(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Valida formato de email
 * @param {string} email - Email para validar
 * @returns {boolean} True se email for válido
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida força da senha
 * @param {string} password - Senha para validar
 * @returns {Object} Objeto com isValid e erros
 */
export function validatePassword(password) {
  const errors = []
  
  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Senha deve conter pelo menos um número')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}