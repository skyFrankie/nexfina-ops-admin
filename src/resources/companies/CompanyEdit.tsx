import {
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  required,
  minValue,
  maxValue,
} from 'react-admin'

export const CompanyEdit = () => (
  <Edit mutationMode="pessimistic">
    <SimpleForm>
      <TextInput
        source="name"
        validate={required()}
        inputProps={{ maxLength: 200 }}
      />
      <TextInput
        source="tax_id"
        label="Tax ID"
        inputProps={{ maxLength: 50 }}
      />
      <NumberInput
        source="fiscal_year_start"
        label="Fiscal Year Start (month 1–12)"
        validate={[required(), minValue(1), maxValue(12)]}
      />
      <TextInput
        source="phone"
        inputProps={{ maxLength: 50 }}
      />
      <TextInput
        source="address"
        multiline
        rows={2}
        inputProps={{ maxLength: 500 }}
      />
      <TextInput
        source="city"
        inputProps={{ maxLength: 200 }}
      />
      <TextInput
        source="state"
        inputProps={{ maxLength: 200 }}
      />
      <TextInput
        source="postal_code"
        label="Postal Code"
        inputProps={{ maxLength: 20 }}
      />
      <TextInput
        source="country"
        inputProps={{ maxLength: 100 }}
      />
      {/* jurisdiction and base_currency are intentionally NOT editable — require data migration */}
    </SimpleForm>
  </Edit>
)
