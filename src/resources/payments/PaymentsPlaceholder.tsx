import { Card, CardContent, Typography, Box } from '@mui/material'
import { Title } from 'react-admin'

const PaymentsPlaceholder = () => (
  <Box mt={4}>
    <Title title="Payments" />
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Payments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Coming Soon — payment management features are planned for a future release.
        </Typography>
      </CardContent>
    </Card>
  </Box>
)

export default PaymentsPlaceholder
