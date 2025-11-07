import { verifyJWT } from './auth'

/**
 * Middleware para extrair e verificar JWT de um request
 * @param {Request} request - Request do Next.js
 * @returns {Promise<{user: Object, error: string|null}>} User decodificado ou erro
 */
export function extractAuthToken(request) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader) {
      return {
        user: null,
        error: 'Token não fornecido'
      }
    }

    // Esperar formato: "Bearer <token>"
    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return {
        user: null,
        error: 'Formato de token inválido'
      }
    }

    const token = parts[1]

    // Verificar token
    const user = verifyJWT(token)

    return {
      user,
      error: null
    }
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return {
        user: null,
        error: 'Token expirado'
      }
    }

    return {
      user: null,
      error: 'Token inválido'
    }
  }
}

/**
 * Cria uma resposta de erro de autenticação
 * @param {string} message - Mensagem de erro
 * @returns {Response} Response com status 401
 */
export function createAuthErrorResponse(message = 'Não autorizado') {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
}