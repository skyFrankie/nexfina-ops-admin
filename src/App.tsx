import { Admin, Resource, CustomRoutes } from 'react-admin'
import { Route } from 'react-router-dom'
import authProvider from './authProvider'
import dataProvider from './dataProvider'
import { OpsLayout } from './layout/OpsLayout'
import AuditLogList from './components/AuditLogList'
import PaymentsPlaceholder from './resources/payments/PaymentsPlaceholder'

// Resource views
import { UserList } from './resources/users/UserList'
import { UserShow } from './resources/users/UserShow'
import { CompanyList } from './resources/companies/CompanyList'
import { CompanyShow } from './resources/companies/CompanyShow'
import { CompanyEdit } from './resources/companies/CompanyEdit'
import { JurisdictionList } from './resources/jurisdictions/JurisdictionList'
import { JurisdictionEdit } from './resources/jurisdictions/JurisdictionEdit'
import { SubscriptionShow } from './resources/subscriptions/SubscriptionShow'
import { QuotaShow } from './resources/quotas/QuotaShow'

const App = () => (
  <Admin
    title="NexFina Ops Admin"
    authProvider={authProvider}
    dataProvider={dataProvider}
    layout={OpsLayout}
    requireAuth
  >
    <Resource
      name="users"
      list={UserList}
      show={UserShow}
      options={{ label: 'Users' }}
    />
    <Resource
      name="companies"
      list={CompanyList}
      show={CompanyShow}
      edit={CompanyEdit}
      options={{ label: 'Companies' }}
    />
    <Resource
      name="jurisdictions"
      list={JurisdictionList}
      edit={JurisdictionEdit}
      options={{ label: 'Jurisdictions' }}
    />
    <Resource
      name="audit-log"
      list={AuditLogList}
      options={{ label: 'Audit Log' }}
    />
    <CustomRoutes>
      <Route path="/payments" element={<PaymentsPlaceholder />} />
      <Route path="/companies/:id/subscriptions" element={<SubscriptionShow />} />
      <Route path="/companies/:id/quotas" element={<QuotaShow />} />
    </CustomRoutes>
  </Admin>
)

export default App
