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
  const [scope, role, ...usernameParts] = token.split('-')

  if (scope !== 'mvp' || !role || usernameParts.length === 0) {
    return null
  }

  return {
    token,
    isAdmin: role === 'admin',
    username: usernameParts.join(' '),
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