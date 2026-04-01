import { Title } from 'react-admin'
import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

interface QuotaEntry {
  quota_type: string
  used: number
  limit: number | null
}

const getBarColor = (pct: number): string => {
  if (pct >= 100) return '#d32f2f'
  if (pct >= 80) return '#f57c00'
  return '#388e3c'
}

export const QuotaShow = () => {
  const { id: companyId } = useParams<{ id: string }>()
  const [quotas, setQuotas] = useState<QuotaEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!companyId) return
    fetch(`/api/v1/ops/companies/${companyId}/quotas`, {
      headers: {
        Authorization: `Bearer ${sessionStorage.getItem('ops_access_token')}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setQuotas(data.items ?? data.quotas ?? data ?? [])
      })
      .catch(() => setQuotas([]))
      .finally(() => setLoading(false))
  }, [companyId])

  if (loading) return <p>Loading...</p>
  if (!companyId) return <p>Company not found</p>

  return (
    <div style={{ padding: 16 }}>
      <Title title="Quota Usage" />
      <Link to={`/companies/${companyId}/show`} style={{ marginBottom: 16, display: 'inline-block' }}>
        ← Back to Company
      </Link>

      <table style={{ borderCollapse: 'collapse', marginTop: 12, width: '100%', maxWidth: 700, fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #444' }}>
            <th style={thStyle}>Quota Type</th>
            <th style={thStyle}>Used</th>
            <th style={thStyle}>Limit</th>
            <th style={{ ...thStyle, width: 200 }}>Usage</th>
          </tr>
        </thead>
        <tbody>
          {quotas.length === 0 ? (
            <tr><td colSpan={4} style={{ padding: 12, color: '#888', textAlign: 'center' }}>No quota data</td></tr>
          ) : (
            quotas.map((q) => {
              const limit = q.limit
              const pct = limit ? Math.min((q.used / limit) * 100, 120) : 0
              const color = limit ? getBarColor((q.used / limit) * 100) : '#888'
              return (
                <tr key={q.quota_type} style={{ borderBottom: '1px solid #333' }}>
                  <td style={tdStyle}>{q.quota_type}</td>
                  <td style={{ ...tdStyle, color, fontWeight: pct >= 80 ? 600 : 400 }}>{q.used}</td>
                  <td style={tdStyle}>{limit ?? '∞'}</td>
                  <td style={tdStyle}>
                    {limit ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 120, height: 10, background: '#333', borderRadius: 5, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: color, borderRadius: 5 }} />
                        </div>
                        <span style={{ fontSize: 12, color }}>{Math.round((q.used / limit) * 100)}%</span>
                      </div>
                    ) : (
                      <span style={{ color: '#888' }}>Unlimited</span>
                    )}
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

const thStyle = { padding: '8px 12px', textAlign: 'left' as const, color: '#aaa' }
const tdStyle = { padding: '6px 12px' }
