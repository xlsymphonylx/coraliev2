import axios from 'axios'

const TOKEN_KEY = 'coralie_token'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `http://${location.hostname}:3000`,
})

function getAuthorizationHeader() {
  const fromMemory = client.defaults.headers.common['Authorization']
  if (typeof fromMemory === 'string') return fromMemory

  // Restore from localStorage on refresh
  const stored = localStorage.getItem(TOKEN_KEY)
  if (stored) {
    client.defaults.headers.common['Authorization'] = `Bearer ${stored}`
    return `Bearer ${stored}`
  }

  return null
}

function parseSessionToken() {
  const authorizationHeader = getAuthorizationHeader()

  if (!authorizationHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authorizationHeader.slice('Bearer '.length)

  try {
    // Decode JWT payload (second base64 segment) to extract claims
    const payloadBase64 = token.split('.')[1]
    if (!payloadBase64) return null

    const json = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'))
    const claims = JSON.parse(json)

    if (!claims.sub || !claims.username || !Array.isArray(claims.roles)) {
      return null
    }

    const isAdmin = claims.roles.some(
      (r: string) => r.toLowerCase() === 'admin',
    )

    return {
      token,
      isAdmin,
      username: claims.username,
    }
  } catch {
    return null
  }
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
  client.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
  delete client.defaults.headers.common['Authorization']
}

export function checkToken() {
  return Boolean(getAuthorizationHeader())
}

export function getSessionUsername() {
  return parseSessionToken()?.username ?? null
}

export function checkAdminToken() {
  return parseSessionToken()?.isAdmin ?? false
}

export default client