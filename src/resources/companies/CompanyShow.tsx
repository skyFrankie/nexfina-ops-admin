import {
  Show,
  SimpleShowLayout,
  TextField,
  DateField,
  NumberField,
  ArrayField,
  Datagrid,
  useRecordContext,
  TopToolbar,
  EditButton,
  Link,
} from 'react-admin'

const CompanyShowActions = () => (
  <TopToolbar>
    <EditButton />
  </TopToolbar>
)

const MembersPanel = () => {
  const record = useRecordContext()
  if (!record?.members?.length) {
    return <p style={{ color: '#888', margin: '8px 0' }}>No members</p>
  }
  return (
    <ArrayField source="members" label="Members">
      <Datagrid bulkActionButtons={false}>
        <TextField source="user_id" label="User ID" />
        <TextField source="email" emptyText="—" />
        <TextField source="display_name" label="Name" emptyText="—" />
        <TextField source="role" />
        <DateField source="joined_at" label="Joined" showTime={false} />
      </Datagrid>
    </ArrayField>
  )
}

const SubscriptionPanel = () => {
  const record = useRecordContext()
  if (!record) return null
  return (
    <div style={{ margin: '8px 0' }}>
      <strong>Subscription</strong>
      <ul style={{ margin: '4px 0', paddingLeft: '1.2em' }}>
        <li>Tier: <strong>{record.subscription_tier}</strong></li>
        <li>
          Trial:{' '}
          {record.trial_expires_at
            ? new Date(record.trial_expires_at as string).toLocaleDateString()
            : 'Not on trial'}
        </li>
      </ul>
      <Link to={`/companies/${record.id as string}/subscriptions`}>
        Manage Subscription →
      </Link>
      {'  '}
      <Link to={`/companies/${record.id as string}/quotas`}>
        View Quotas →
      </Link>
    </div>
  )
}

export const CompanyShow = () => (
  <Show actions={<CompanyShowActions />}>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="jurisdiction" />
      <TextField source="base_currency" label="Currency" />
      <TextField source="tax_id" label="Tax ID" emptyText="—" />
      <NumberField source="fiscal_year_start" label="Fiscal Year Start (month)" />
      <TextField source="phone" emptyText="—" />
      <TextField source="address" emptyText="—" />
      <TextField source="city" emptyText="—" />
      <TextField source="state" emptyText="—" />
      <TextField source="postal_code" label="Postal Code" emptyText="—" />
      <TextField source="country" emptyText="—" />
      <DateField source="created_at" label="Created" showTime />
      <SubscriptionPanel />
      <MembersPanel />
    </SimpleShowLayout>
  </Show>
)
