import {
  Show,
  SimpleShowLayout,
  TextField,
  BooleanField,
  DateField,
  ArrayField,
  Datagrid,
  useRecordContext,
  useDataProvider,
  useNotify,
  useRefresh,
  Button,
  TopToolbar,
  EditButton,
} from 'react-admin'
import { useState } from 'react'

const UserShowActions = () => {
  const record = useRecordContext()
  const dataProvider = useDataProvider()
  const notify = useNotify()
  const refresh = useRefresh()
  const [loading, setLoading] = useState(false)

  if (!record) return null

  const handleActivate = async () => {
    setLoading(true)
    try {
      await dataProvider.activateUser(record.id as string)
      notify('User activated', { type: 'success' })
      refresh()
    } catch {
      notify('Failed to activate user', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async () => {
    setLoading(true)
    try {
      await dataProvider.deactivateUser(record.id as string)
      notify('User deactivated', { type: 'success' })
      refresh()
    } catch {
      notify('Failed to deactivate user', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <TopToolbar>
      <EditButton />
      {record.is_active ? (
        <Button
          label="Deactivate"
          onClick={handleDeactivate}
          disabled={loading}
          color="error"
        />
      ) : (
        <Button
          label="Activate"
          onClick={handleActivate}
          disabled={loading}
          color="primary"
        />
      )}
    </TopToolbar>
  )
}

const CompanyMembershipsPanel = () => {
  const record = useRecordContext()
  if (!record?.memberships?.length) {
    return <p style={{ color: '#888', margin: '8px 0' }}>No company memberships</p>
  }
  return (
    <ArrayField source="memberships" label="Company Memberships">
      <Datagrid bulkActionButtons={false}>
        <TextField source="company_id" label="Company ID" />
        <TextField source="company_name" label="Company Name" emptyText="—" />
        <TextField source="role" />
        <DateField source="joined_at" label="Joined" showTime={false} />
      </Datagrid>
    </ArrayField>
  )
}

export const UserShow = () => (
  <Show actions={<UserShowActions />}>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="email" />
      <TextField source="display_name" label="Display Name" emptyText="—" />
      <TextField source="first_name" label="First Name" emptyText="—" />
      <TextField source="last_name" label="Last Name" emptyText="—" />
      <BooleanField source="is_active" label="Active" />
      <TextField source="subscription_tier" label="Subscription Tier" />
      <BooleanField source="has_used_trial" label="Has Used Trial" />
      <DateField source="created_at" label="Created" showTime />
      <CompanyMembershipsPanel />
    </SimpleShowLayout>
  </Show>
)
