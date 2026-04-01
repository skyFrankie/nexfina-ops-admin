import {
  List,
  Datagrid,
  TextField,
  DateField,
  TextInput,
} from 'react-admin'

const companyFilters = [
  <TextInput key="search" source="search" label="Search by name" alwaysOn />,
]

export const CompanyList = () => (
  <List
    filters={companyFilters}
    sort={{ field: 'created_at', order: 'DESC' }}
    perPage={25}
  >
    <Datagrid rowClick="show" bulkActionButtons={false}>
      <TextField source="name" />
      <TextField source="jurisdiction" />
      <TextField source="subscription_tier" label="Tier" />
      <TextField source="base_currency" label="Currency" />
      <DateField source="created_at" label="Created" showTime={false} />
    </Datagrid>
  </List>
)
