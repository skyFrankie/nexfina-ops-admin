import type { DataProvider, GetListParams, GetOneParams, UpdateParams } from 'react-admin'
import { TOKEN_KEY } from './authProvider'

const API_BASE = '/api/v1/ops'

function getAuthHeaders(): Record<string, string> {
  const token = sessionStorage.getItem(TOKEN_KEY)
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers as Record<string, string> ?? {}),
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const message = body?.detail ?? `HTTP ${res.status}`
    const err = new Error(message) as Error & { status: number }
    err.status = res.status
    throw err
  }
  return res
}

// Map react-admin resource names to API path segments
function resourcePath(resource: string): string {
  // react-admin uses plural names; API uses same convention
  return resource
}

const dataProvider: DataProvider = {
  getList: async (resource: string, params: GetListParams) => {
    const { page = 1, perPage = 25 } = params.pagination ?? {}
    const { field = 'id', order = 'ASC' } = params.sort ?? {}
    const filter = params.filter ?? {}

    const query = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
      sort_field: field,
      sort_order: order.toLowerCase(),
    })

    // Forward all filter keys as query params
    for (const [key, value] of Object.entries(filter)) {
      if (value !== undefined && value !== null && value !== '') {
        query.set(key, String(value))
      }
    }

    const res = await apiFetch(`/${resourcePath(resource)}?${query}`)
    const json = await res.json()

    // Jurisdictions endpoint returns a plain array (not paginated)
    if (Array.isArray(json)) {
      const data = json.map((item: Record<string, unknown>) => ({
        ...item,
        id: item.id ?? item.jurisdiction ?? item.code,
      }))
      return { data, total: data.length }
    }

    // Standard paginated response: {items, total, page, per_page}
    return {
      data: json.items ?? json.data ?? [],
      total: json.total ?? (json.items ?? []).length,
    }
  },

  getOne: async (resource: string, params: GetOneParams) => {
    const res = await apiFetch(`/${resourcePath(resource)}/${params.id}`)
    const json = await res.json()
    // Ensure record has an id field for react-admin
    if (!json.id) {
      json.id = json.jurisdiction ?? json.code ?? params.id
    }
    return { data: json }
  },

  getMany: async (resource: string, params) => {
    const results = await Promise.all(
      params.ids.map((id) =>
        apiFetch(`/${resourcePath(resource)}/${id}`).then((r) => r.json())
      )
    )
    return { data: results }
  },

  getManyReference: async (resource: string, params) => {
    const { page = 1, perPage = 25 } = params.pagination ?? {}
    const query = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
      [params.target]: String(params.id),
    })

    const res = await apiFetch(`/${resourcePath(resource)}?${query}`)
    const json = await res.json()
    return {
      data: json.items ?? [],
      total: json.total ?? 0,
    }
  },

  update: async (resource: string, params: UpdateParams) => {
    const res = await apiFetch(`/${resourcePath(resource)}/${params.id}`, {
      method: 'PATCH',
      body: JSON.stringify(params.data),
    })
    const json = await res.json()
    return { data: json }
  },

  updateMany: async (resource: string, params) => {
    await Promise.all(
      params.ids.map((id) =>
        apiFetch(`/${resourcePath(resource)}/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(params.data),
        })
      )
    )
    return { data: params.ids }
  },

  // Create not generally used in ops panel (ops manages existing data)
  create: async (resource: string, params) => {
    const res = await apiFetch(`/${resourcePath(resource)}`, {
      method: 'POST',
      body: JSON.stringify(params.data),
    })
    const json = await res.json()
    return { data: json }
  },

  // Delete not generally used in ops panel
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete: async (resource: string, params): Promise<any> => {
    await apiFetch(`/${resourcePath(resource)}/${params.id}`, {
      method: 'DELETE',
    })
    return { data: { id: params.id } }
  },

  deleteMany: async (resource: string, params) => {
    await Promise.all(
      params.ids.map((id) =>
        apiFetch(`/${resourcePath(resource)}/${id}`, { method: 'DELETE' })
      )
    )
    return { data: params.ids }
  },

  // ---- Custom action methods (called via useDataProvider) ----

  activateUser: async (userId: string) => {
    const res = await apiFetch(`/users/${userId}/activate`, { method: 'POST' })
    return res.json()
  },

  deactivateUser: async (userId: string) => {
    const res = await apiFetch(`/users/${userId}/deactivate`, { method: 'POST' })
    return res.json()
  },

  upgradeTrial: async (companyId: string, targetTier: string) => {
    const res = await apiFetch(`/companies/${companyId}/subscription/upgrade`, {
      method: 'POST',
      body: JSON.stringify({ target_tier: targetTier }),
    })
    return res.json()
  },

  changeTier: async (companyId: string, targetTier: string) => {
    const res = await apiFetch(`/companies/${companyId}/subscription/change-tier`, {
      method: 'POST',
      body: JSON.stringify({ target_tier: targetTier }),
    })
    return res.json()
  },

  resetJurisdiction: async (code: string) => {
    const res = await apiFetch(`/jurisdictions/${code}/reset`, { method: 'POST' })
    return res.json()
  },

  updateJurisdictionConfig: async (code: string, config: object) => {
    const res = await apiFetch(`/jurisdictions/${code}`, {
      method: 'PUT',
      body: JSON.stringify({ config }),
    })
    return res.json()
  },
}

export default dataProvider
