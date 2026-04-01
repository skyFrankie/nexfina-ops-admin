import {
  List,
  Datagrid,
  TextField,
  DateField,
  FunctionField,
  SearchInput,
  SelectInput,
  useRecordContext,
} from 'react-admin'

const auditFilters = [
  <SearchInput key="search" source="target_id" alwaysOn placeholder="Target ID" />,
  <SelectInput
    key="target_type"
    source="target_type"
    choices={[
      { id: 'user', name: 'User' },
      { id: 'company', name: 'Company' },
      { id: 'subscription', name: 'Subscription' },
      { id: 'jurisdiction', name: 'Jurisdiction' },
    ]}
  />,
]

const ActionField = () => {
  const record = useRecordContext()
  if (!record) return null
  const colorMap: Record<string, string> = {
    activate: 'success.main',
    deactivate: 'error.main',
    upgrade: 'info.main',
    change_tier: 'warning.main',
    update: 'text.primary',
    reset: 'warning.dark',
  }
  const color = colorMap[record.action] ?? 'text.secondary'
  return (
    <span style={{ fontWeight: 600, color: color as string }}>
      {record.action}
    </span>
  )
}

const AuditLogList = () => (
  <List
    resource="audit-log"
    filters={auditFilters}
    sort={{ field: 'created_at', order: 'DESC' }}
    perPage={50}
    title="Ops Audit Log"
  >
    <Datagrid bulkActionButtons={false} rowClick={false}>
      <DateField source="created_at" showTime label="Time" />
      <TextField source="admin_email" label="Admin" />
      <FunctionField label="Action" render={() => <ActionField />} />
      <TextField source="target_type" label="Target Type" />
      <TextField source="target_id" label="Target ID" />
    </Datagrid>
  </List>
)

export default AuditLogList
