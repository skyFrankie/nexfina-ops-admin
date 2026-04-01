import {
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
} from 'react-admin'

export const JurisdictionList = () => (
  <List
    sort={{ field: 'jurisdiction', order: 'ASC' }}
    perPage={25}
    exporter={false}
  >
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <TextField source="jurisdiction" label="Code" />
      <TextField source="status" label="Status" emptyText="defaults only" />
      <DateField source="updated_at" label="Last Updated" showTime={false} emptyText="Never" />
      <EditButton />
    </Datagrid>
  </List>
)
