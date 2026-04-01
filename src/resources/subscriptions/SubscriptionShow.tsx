import { useDataProvider, useNotify, Button, Title } from 'react-admin'
import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'

const PAID_TIERS = [
  { id: 'starter', name: 'Starter' },
  { id: 'pro', name: 'Pro' },
  { id: 'enterprise', name: 'Enterprise' },
]

const ALL_NON_TRIAL_TIERS = [
  { id: 'free', name: 'Free' },
  ...PAID_TIERS,
]

interface SubscriptionData {
  company_id: string
  company_name?: string
  subscription_tier: string
  is_trial: boolean
  trial_expires_at?: string
  grace_period_ends_at?: string
}

export const SubscriptionShow = () => {
  const { id: companyId } = useParams<{ id: string }>()
  const dataProvider = useDataProvider()
  const notify = useNotify()
  const [data, setData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!companyId) return
    try {
      const res = await fetch(`/api/v1/ops/companies/${companyId}/subscription`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('ops_access_token')}`,
        },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setData(await res.json())
    } catch (err) {
      notify('Failed to load subscription', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }, [companyId, notify])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) return <p>Loading...</p>
  if (!data || !companyId) return <p>Subscription not found</p>

  return (
    <div style={{ padding: 16 }}>
      <Title title="Subscription Management" />
      <Link to={`/companies/${companyId}/show`} style={{ marginBottom: 16, display: 'inline-block' }}>
        ← Back to Company
      </Link>

      <table style={{ borderCollapse: 'collapse', marginTop: 12, fontSize: 14 }}>
        <tbody>
          <tr><td style={labelStyle}>Company ID</td><td style={valStyle}>{data.company_id}</td></tr>
          {data.company_name && <tr><td style={labelStyle}>Company</td><td style={valStyle}>{data.company_name}</td></tr>}
          <tr><td style={labelStyle}>Subscription Tier</td><td style={valStyle}><strong>{data.subscription_tier}</strong></td></tr>
          <tr><td style={labelStyle}>On Trial</td><td style={valStyle}>{data.is_trial ? 'Yes' : 'No'}</td></tr>
          {data.trial_expires_at && <tr><td style={labelStyle}>Trial Expires</td><td style={valStyle}>{new Date(data.trial_expires_at).toLocaleDateString()}</td></tr>}
          {data.grace_period_ends_at && <tr><td style={labelStyle}>Grace Period Ends</td><td style={valStyle}>{new Date(data.grace_period_ends_at).toLocaleDateString()}</td></tr>}
        </tbody>
      </table>

      {data.is_trial ? (
        <UpgradeSection companyId={companyId} dataProvider={dataProvider} notify={notify} onRefresh={fetchData} />
      ) : (
        <ChangeTierSection companyId={companyId} currentTier={data.subscription_tier} dataProvider={dataProvider} notify={notify} onRefresh={fetchData} />
      )}
    </div>
  )
}

const labelStyle = { padding: '6px 16px 6px 0', color: '#888', whiteSpace: 'nowrap' as const }
const valStyle = { padding: '6px 0' }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UpgradeSection = ({ companyId, dataProvider, notify, onRefresh }: { companyId: string; dataProvider: any; notify: any; onRefresh: () => void }) => {
  const [targetTier, setTargetTier] = useState('starter')
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      await dataProvider.upgradeTrial(companyId, targetTier)
      notify(`Trial upgraded to ${targetTier}`, { type: 'success' })
      onRefresh()
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Upgrade failed', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: 24 }}>
      <h4>Upgrade Trial</h4>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <select value={targetTier} onChange={e => setTargetTier(e.target.value)} style={{ padding: '4px 8px', fontSize: 14 }}>
          {PAID_TIERS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <Button label="Upgrade Trial to Paid" onClick={handleUpgrade} disabled={loading} />
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ChangeTierSection = ({ companyId, currentTier, dataProvider, notify, onRefresh }: { companyId: string; currentTier: string; dataProvider: any; notify: any; onRefresh: () => void }) => {
  const [targetTier, setTargetTier] = useState(currentTier)
  const [loading, setLoading] = useState(false)

  const handleChange = async () => {
    if (targetTier === currentTier) {
      notify('Target tier is the same as current', { type: 'warning' })
      return
    }
    setLoading(true)
    try {
      const result = await dataProvider.changeTier(companyId, targetTier) as { warnings?: string[] }
      const warnings = result?.warnings ?? []
      if (warnings.length > 0) {
        notify(`Tier changed. Warnings: ${warnings.join('; ')}`, { type: 'warning' })
      } else {
        notify(`Tier changed to ${targetTier}`, { type: 'success' })
      }
      onRefresh()
    } catch (err: unknown) {
      notify(err instanceof Error ? err.message : 'Change failed', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: 24 }}>
      <h4>Change Tier</h4>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <select value={targetTier} onChange={e => setTargetTier(e.target.value)} style={{ padding: '4px 8px', fontSize: 14 }}>
          {ALL_NON_TRIAL_TIERS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <Button label="Change Tier" onClick={handleChange} disabled={loading} />
      </div>
    </div>
  )
}
