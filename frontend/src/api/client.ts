import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

function getAuthorizationHeader() {
  const authorizationHeader = client.defaults.headers.common['Authorization']

  return typeof authorizationHeader === 'string' ? authorizationHeader : null
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
  client.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export function clearToken() {
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