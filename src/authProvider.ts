import type { AuthProvider } from 'react-admin'

const API_BASE = '/api/v1'
const TOKEN_KEY = 'ops_access_token'
const IDENTITY_KEY = 'ops_identity'

const authProvider: AuthProvider = {
  login: async ({ username, password }: { username: string; password: string }) => {
    // Step 1: Login via existing auth endpoint
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: username, password }),
    })

    if (!loginRes.ok) {
      const err = await loginRes.json().catch(() => ({}))
      throw new Error(err?.detail ?? 'Login failed')
    }

    const tokens = await loginRes.json()
    const accessToken: string = tokens.access_token ?? tokens.AccessToken

    if (!accessToken) {
      throw new Error('No access token in login response')
    }

    // Step 2: Verify user has ops admin access
    const meRes = await fetch(`${API_BASE}/ops/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (meRes.status === 403) {
      throw new Error('Not an ops admin — contact NexFina platform team')
    }
    if (!meRes.ok) {
      throw new Error('Unable to verify ops admin status')
    }

    const identity = await meRes.json()

    // Store in sessionStorage (not localStorage — security for admin session)
    sessionStorage.setItem(TOKEN_KEY, accessToken)
    sessionStorage.setItem(IDENTITY_KEY, JSON.stringify(identity))
  },

  checkAuth: async () => {
    const token = sessionStorage.getItem(TOKEN_KEY)
    if (!token) throw new Error('Not authenticated')

    const res = await fetch(`${API_BASE}/ops/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.status === 401 || res.status === 403) {
      sessionStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(IDENTITY_KEY)
      throw new Error('Session expired or access revoked')
    }
  },

  logout: async () => {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(IDENTITY_KEY)
  },

  getIdentity: async () => {
    const cached = sessionStorage.getItem(IDENTITY_KEY)
    if (cached) {
      const identity = JSON.parse(cached)
      return {
        id: identity.id,
        fullName: identity.display_name ?? identity.email,
        avatar: undefined,
      }
    }

    const token = sessionStorage.getItem(TOKEN_KEY)
    if (!token) throw new Error('Not authenticated')

    const res = await fetch(`${API_BASE}/ops/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Failed to fetch identity')

    const identity = await res.json()
    sessionStorage.setItem(IDENTITY_KEY, JSON.stringify(identity))
    return {
      id: identity.id,
      fullName: identity.display_name ?? identity.email,
      avatar: undefined,
    }
  },

  checkError: async (error: { status?: number }) => {
    if (error.status === 401 || error.status === 403) {
      sessionStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(IDENTITY_KEY)
      throw error
    }
  },

  getPermissions: async () => 'ops_admin',
}

export default authProvider
export { TOKEN_KEY }
