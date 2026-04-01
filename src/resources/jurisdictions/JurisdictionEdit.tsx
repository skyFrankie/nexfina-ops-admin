import {
  Edit,
  useRecordContext,
  useDataProvider,
  useNotify,
  useRefresh,
  Button,
  TopToolbar,
} from 'react-admin'
import { useState, useEffect, useCallback } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TaxRules {
  profits_tax_rate: number
  two_tier_threshold: number
  two_tier_lower_rate: number
  fiscal_year_options: number[]
}

interface ContributionRuleEntry {
  employee_rate: string
  employer_rate: string
  monthly_cap: string
  min_income: string
  max_relevant_income: string
  currency: string
}

interface ContributionRules {
  mpf: ContributionRuleEntry
}

interface PayrollColumn {
  column_key: string
  column_name: string
  column_type: 'earning' | 'deduction' | 'employer_contribution'
  is_percentage: boolean
  coa_code_fallback: string
  sort_order: number
}

interface PayrollDefaults {
  columns: PayrollColumn[]
  net_pay_liability_coa_keywords: string[]
  net_pay_liability_coa_code_fallback: string
  notes: string[]
}

interface PayStubSection {
  key: string
  title: string
}

interface PayStubTemplate {
  bilingual: boolean
  title: string
  sections: PayStubSection[]
  legal_notices: string[]
  footer: string
}

interface JurisdictionConfig {
  tax_rules: TaxRules
  currency: string
  payroll_defaults: PayrollDefaults
  contribution_rules: ContributionRules
  pay_stub_template: PayStubTemplate
}

// ─── Section: Tax Rules ───────────────────────────────────────────────────────

const FISCAL_YEAR_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

const TaxRulesSection = ({
  taxRules,
  onChange,
}: {
  taxRules: TaxRules
  onChange: (updated: TaxRules) => void
}) => {
  const set = (key: keyof TaxRules, value: unknown) =>
    onChange({ ...taxRules, [key]: value })

  const toggleFiscalOption = (month: number) => {
    const current = taxRules.fiscal_year_options ?? []
    const next = current.includes(month)
      ? current.filter(m => m !== month)
      : [...current, month].sort((a, b) => a - b)
    set('fiscal_year_options', next)
  }

  return (
    <div>
      <h3 style={sectionHeading}>Tax Rules</h3>
      <div style={fieldGrid}>
        <label style={fieldLabel}>
          Profits Tax Rate (0–1)
          <input
            type="number"
            step="0.001"
            min="0"
            max="1"
            value={taxRules.profits_tax_rate ?? ''}
            onChange={e => set('profits_tax_rate', parseFloat(e.target.value))}
            style={inputStyle}
          />
        </label>
        <label style={fieldLabel}>
          Two-Tier Lower Rate (0–1)
          <input
            type="number"
            step="0.001"
            min="0"
            max="1"
            value={taxRules.two_tier_lower_rate ?? ''}
            onChange={e => set('two_tier_lower_rate', parseFloat(e.target.value))}
            style={inputStyle}
          />
        </label>
        <label style={fieldLabel}>
          Two-Tier Threshold (HKD)
          <input
            type="number"
            step="1000"
            min="0"
            value={taxRules.two_tier_threshold ?? ''}
            onChange={e => set('two_tier_threshold', parseInt(e.target.value, 10))}
            style={inputStyle}
          />
        </label>
      </div>
      <div style={{ marginTop: 12 }}>
        <span style={{ fontWeight: 500, display: 'block', marginBottom: 6 }}>
          Fiscal Year Start Options (months allowed):
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {FISCAL_YEAR_OPTIONS.map(m => {
            const selected = (taxRules.fiscal_year_options ?? []).includes(m)
            return (
              <button
                key={m}
                type="button"
                onClick={() => toggleFiscalOption(m)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                  border: `1px solid ${selected ? '#1976d2' : '#ccc'}`,
                  background: selected ? '#1976d2' : '#fff',
                  color: selected ? '#fff' : '#333',
                  cursor: 'pointer',
                  fontWeight: selected ? 600 : 400,
                }}
              >
                {m}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Section: Payroll Defaults ────────────────────────────────────────────────

const COLUMN_TYPES = ['earning', 'deduction', 'employer_contribution'] as const

const PayrollDefaultsSection = ({
  columns,
  onChange,
}: {
  columns: PayrollColumn[]
  onChange: (updated: PayrollColumn[]) => void
}) => {
  const updateCol = (idx: number, key: keyof PayrollColumn, value: unknown) => {
    const next = columns.map((c, i) =>
      i === idx ? { ...c, [key]: value } : c
    )
    onChange(next)
  }

  const addColumn = () => {
    onChange([
      ...columns,
      {
        column_key: '',
        column_name: '',
        column_type: 'earning',
        is_percentage: false,
        coa_code_fallback: '',
        sort_order: columns.length + 1,
      },
    ])
  }

  const removeColumn = (idx: number) => {
    onChange(columns.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <h3 style={sectionHeading}>Payroll Defaults</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e0e0e0', textAlign: 'left' }}>
              <th style={th}>Key</th>
              <th style={th}>Name</th>
              <th style={th}>Type</th>
              <th style={th}>%?</th>
              <th style={th}>CoA Code</th>
              <th style={th}>Order</th>
              <th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {columns.map((col, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={td}>
                  <input
                    value={col.column_key}
                    onChange={e => updateCol(idx, 'column_key', e.target.value)}
                    maxLength={50}
                    style={{ ...inputStyle, width: 100 }}
                  />
                </td>
                <td style={td}>
                  <input
                    value={col.column_name}
                    onChange={e => updateCol(idx, 'column_name', e.target.value)}
                    maxLength={100}
                    style={{ ...inputStyle, width: 130 }}
                  />
                </td>
                <td style={td}>
                  <select
                    value={col.column_type}
                    onChange={e => updateCol(idx, 'column_type', e.target.value)}
                    style={{ ...inputStyle, width: 160 }}
                  >
                    {COLUMN_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </td>
                <td style={td}>
                  <input
                    type="checkbox"
                    checked={col.is_percentage}
                    onChange={e => updateCol(idx, 'is_percentage', e.target.checked)}
                  />
                </td>
                <td style={td}>
                  <input
                    value={col.coa_code_fallback}
                    onChange={e => updateCol(idx, 'coa_code_fallback', e.target.value)}
                    maxLength={10}
                    style={{ ...inputStyle, width: 80 }}
                  />
                </td>
                <td style={td}>
                  <input
                    type="number"
                    value={col.sort_order}
                    onChange={e => updateCol(idx, 'sort_order', parseInt(e.target.value, 10))}
                    style={{ ...inputStyle, width: 60 }}
                  />
                </td>
                <td style={td}>
                  <button
                    type="button"
                    onClick={() => removeColumn(idx)}
                    style={{ color: '#d32f2f', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={addColumn}
        style={{
          marginTop: 8,
          padding: '4px 12px',
          background: '#1976d2',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        + Add Column
      </button>
    </div>
  )
}

// ─── Section: MPF / Contribution Rules ───────────────────────────────────────

const ContributionRulesSection = ({
  rules,
  onChange,
}: {
  rules: ContributionRules
  onChange: (updated: ContributionRules) => void
}) => {
  const setMpf = (key: keyof ContributionRuleEntry, value: string) =>
    onChange({ ...rules, mpf: { ...rules.mpf, [key]: value } })

  return (
    <div>
      <h3 style={sectionHeading}>MPF / Contribution Rules</h3>
      <div style={fieldGrid}>
        {(
          [
            ['employee_rate', 'Employee Rate (e.g. 0.05)'],
            ['employer_rate', 'Employer Rate (e.g. 0.05)'],
            ['monthly_cap', 'Monthly Cap (HKD)'],
            ['min_income', 'Min Relevant Income (HKD)'],
            ['max_relevant_income', 'Max Relevant Income (HKD)'],
          ] as [keyof ContributionRuleEntry, string][]
        ).map(([key, label]) => (
          <label key={key} style={fieldLabel}>
            {label}
            <input
              type="number"
              step="0.01"
              min="0"
              value={rules.mpf[key] ?? ''}
              onChange={e => setMpf(key, e.target.value)}
              style={inputStyle}
            />
          </label>
        ))}
        <label style={fieldLabel}>
          Currency
          <input
            value={rules.mpf.currency ?? ''}
            onChange={e => setMpf('currency', e.target.value)}
            maxLength={3}
            style={inputStyle}
          />
        </label>
      </div>
    </div>
  )
}

// ─── Section: Pay Stub Template ───────────────────────────────────────────────

const PayStubTemplateSection = ({
  template,
  onChange,
}: {
  template: PayStubTemplate
  onChange: (updated: PayStubTemplate) => void
}) => {
  const set = (key: keyof PayStubTemplate, value: unknown) =>
    onChange({ ...template, [key]: value })

  const updateSection = (idx: number, key: keyof PayStubSection, value: string) => {
    const next = template.sections.map((s, i) =>
      i === idx ? { ...s, [key]: value } : s
    )
    set('sections', next)
  }

  const addSection = () => {
    set('sections', [...template.sections, { key: '', title: '' }])
  }

  const removeSection = (idx: number) => {
    set('sections', template.sections.filter((_, i) => i !== idx))
  }

  const updateNotice = (idx: number, value: string) => {
    const next = [...template.legal_notices]
    next[idx] = value
    set('legal_notices', next)
  }

  const addNotice = () => set('legal_notices', [...template.legal_notices, ''])
  const removeNotice = (idx: number) =>
    set('legal_notices', template.legal_notices.filter((_, i) => i !== idx))

  return (
    <div>
      <h3 style={sectionHeading}>Pay Stub Template</h3>
      <div style={fieldGrid}>
        <label style={fieldLabel}>
          Title
          <input
            value={template.title ?? ''}
            onChange={e => set('title', e.target.value)}
            maxLength={200}
            style={inputStyle}
          />
        </label>
        <label style={{ ...fieldLabel, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            checked={template.bilingual ?? false}
            onChange={e => set('bilingual', e.target.checked)}
          />
          Bilingual (EN + ZH)
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Sections:</strong>
        {template.sections.map((s, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <input
              placeholder="key"
              value={s.key}
              onChange={e => updateSection(idx, 'key', e.target.value)}
              maxLength={50}
              style={{ ...inputStyle, width: 120 }}
            />
            <input
              placeholder="title"
              value={s.title}
              onChange={e => updateSection(idx, 'title', e.target.value)}
              maxLength={100}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              type="button"
              onClick={() => removeSection(idx)}
              style={{ color: '#d32f2f', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addSection}
          style={{ marginTop: 6, fontSize: 12, background: 'none', border: '1px solid #ccc', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}
        >
          + Add Section
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Legal Notices:</strong>
        {template.legal_notices.map((notice, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <textarea
              value={notice}
              onChange={e => updateNotice(idx, e.target.value)}
              rows={2}
              maxLength={500}
              style={{ ...inputStyle, flex: 1, resize: 'vertical' }}
            />
            <button
              type="button"
              onClick={() => removeNotice(idx)}
              style={{ color: '#d32f2f', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addNotice}
          style={{ marginTop: 6, fontSize: 12, background: 'none', border: '1px solid #ccc', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}
        >
          + Add Notice
        </button>
      </div>

      <label style={{ ...fieldLabel, marginTop: 12 }}>
        Footer
        <textarea
          value={template.footer ?? ''}
          onChange={e => set('footer', e.target.value)}
          rows={2}
          maxLength={500}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </label>
    </div>
  )
}

// ─── Reset to Defaults Dialog ─────────────────────────────────────────────────

const ResetButton = ({ jurisdictionCode }: { jurisdictionCode: string }) => {
  const dataProvider = useDataProvider()
  const notify = useNotify()
  const refresh = useRefresh()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    setLoading(true)
    try {
      await dataProvider.resetJurisdiction(jurisdictionCode)
      notify('Jurisdiction config reset to defaults', { type: 'success' })
      setConfirm(false)
      refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reset failed'
      notify(msg, { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        label="Reset to Defaults"
        onClick={() => setConfirm(true)}
        color="error"
      />
      {confirm && (
        <div style={dialogOverlay}>
          <div style={dialogBox}>
            <h3 style={{ margin: '0 0 8px' }}>Reset to Defaults?</h3>
            <p style={{ margin: '0 0 16px', color: '#555' }}>
              This will overwrite all custom settings for{' '}
              <strong>{jurisdictionCode}</strong> with hardcoded plugin defaults.
              This action is logged.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setConfirm(false)}
                style={{ padding: '6px 16px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                style={{
                  padding: '6px 16px',
                  background: '#d32f2f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Main Edit Form ───────────────────────────────────────────────────────────

const TABS = ['Tax Rules', 'Payroll Defaults', 'MPF / Contribution', 'Pay Stub Template'] as const
type Tab = typeof TABS[number]

const JurisdictionEditForm = () => {
  const record = useRecordContext()
  const dataProvider = useDataProvider()
  const notify = useNotify()
  const refresh = useRefresh()

  const [activeTab, setActiveTab] = useState<Tab>('Tax Rules')
  const [config, setConfig] = useState<JurisdictionConfig | null>(null)
  const [saving, setSaving] = useState(false)

  // Initialise from record
  useEffect(() => {
    if (record?.config) {
      setConfig(record.config as JurisdictionConfig)
    }
  }, [record])

  const handleSave = useCallback(async () => {
    if (!config || !record) return
    setSaving(true)
    try {
      await dataProvider.updateJurisdictionConfig(record.jurisdiction as string, config)
      notify('Jurisdiction config saved', { type: 'success' })
      refresh()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed'
      notify(msg, { type: 'error' })
    } finally {
      setSaving(false)
    }
  }, [config, dataProvider, notify, record, refresh])

  if (!config) return <p>Loading config...</p>

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>
          Jurisdiction Config — {record?.jurisdiction as string}
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <ResetButton jurisdictionCode={record?.jurisdiction as string} />
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '8px 20px',
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: saving ? 'not-allowed' : 'pointer',
              fontWeight: 600,
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e0e0e0', marginBottom: 20 }}>
        {TABS.map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === tab ? '2px solid #1976d2' : '2px solid transparent',
              color: activeTab === tab ? '#1976d2' : '#555',
              fontWeight: activeTab === tab ? 600 : 400,
              marginBottom: -2,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {activeTab === 'Tax Rules' && (
        <TaxRulesSection
          taxRules={config.tax_rules}
          onChange={updated => setConfig({ ...config, tax_rules: updated })}
        />
      )}
      {activeTab === 'Payroll Defaults' && (
        <PayrollDefaultsSection
          columns={config.payroll_defaults?.columns ?? []}
          onChange={updated => setConfig({
            ...config,
            payroll_defaults: { ...config.payroll_defaults, columns: updated },
          })}
        />
      )}
      {activeTab === 'MPF / Contribution' && (
        <ContributionRulesSection
          rules={config.contribution_rules}
          onChange={updated => setConfig({ ...config, contribution_rules: updated })}
        />
      )}
      {activeTab === 'Pay Stub Template' && (
        <PayStubTemplateSection
          template={config.pay_stub_template}
          onChange={updated => setConfig({ ...config, pay_stub_template: updated })}
        />
      )}
    </div>
  )
}

const JurisdictionEditActions = () => {
  const record = useRecordContext()
  if (!record) return null
  return (
    <TopToolbar>
      {/* Save is inline in the form */}
    </TopToolbar>
  )
}

export const JurisdictionEdit = () => (
  <Edit actions={<JurisdictionEditActions />}>
    <JurisdictionEditForm />
  </Edit>
)

// ─── Shared styles ────────────────────────────────────────────────────────────

const sectionHeading: React.CSSProperties = {
  margin: '0 0 12px',
  fontSize: 16,
  fontWeight: 600,
  color: '#1976d2',
  borderBottom: '1px solid #e3f2fd',
  paddingBottom: 6,
}

const fieldGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 12,
}

const fieldLabel: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
  fontSize: 13,
  fontWeight: 500,
  color: '#333',
}

const inputStyle: React.CSSProperties = {
  padding: '6px 8px',
  border: '1px solid #ccc',
  borderRadius: 4,
  fontSize: 13,
  width: '100%',
  boxSizing: 'border-box',
}

const th: React.CSSProperties = {
  padding: '6px 8px 6px 0',
  fontWeight: 600,
  fontSize: 12,
  color: '#555',
}

const td: React.CSSProperties = {
  padding: '4px 8px 4px 0',
  verticalAlign: 'middle',
}

const dialogOverlay: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
}

const dialogBox: React.CSSProperties = {
  background: '#fff',
  borderRadius: 8,
  padding: 24,
  maxWidth: 420,
  width: '90%',
  boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
}
