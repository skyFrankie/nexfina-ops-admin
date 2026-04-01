import {
  List,
  Datagrid,
  TextField,
  BooleanField,
  DateField,
  TextInput,
  useRecordContext,
  FunctionField,
} from 'react-admin'

const userFilters = [
  <TextInput key="search" source="search" label="Search by email" alwaysOn />,
  <TextInput key="company_id" source="company_id" label="Company ID" />,
]

const SubscriptionTierField = () => {
  const record = useRecordContext()
  if (!record) return null
  const tier = record.subscription_tier as string
  const colors: Record<string, string> = {
    free: '#888',
    starter: '#1976d2',
    pro: '#388e3c',
    enterprise: '#7b1fa2',
    trial: '#f57c00',
  }
  return (
    <span style={{ color: colors[tier] ?? '#333', fontWeight: 500 }}>
      {tier ?? '—'}
    </span>
  )
}

export const UserList = () => (
  <List
    filters={userFilters}
    sort={{ field: 'created_at', order: 'DESC' }}
    perPage={25}
  >
    <Datagrid rowClick="show" bulkActionButtons={false}>
      <TextField source="email" />
      <TextField source="display_name" label="Name" emptyText="—" />
      <BooleanField source="is_active" label="Active" />
      <FunctionField
        label="Tier"
        render={() => <SubscriptionTierField />}
      />
      <DateField source="created_at" label="Created" showTime={false} />
    </Datagrid>
  </List>
)
