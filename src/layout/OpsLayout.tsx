import type { ReactNode } from 'react'
import { Layout, AppBar, TitlePortal } from 'react-admin'
import { Typography, Box } from '@mui/material'

const OpsAppBar = () => (
  <AppBar>
    <TitlePortal />
    <Box sx={{ flex: 1 }} />
    <Typography variant="body2" sx={{ opacity: 0.8, mr: 2 }}>
      NexFina Internal Ops
    </Typography>
  </AppBar>
)

export const OpsLayout = ({ children }: { children?: ReactNode }) => (
  <Layout appBar={OpsAppBar}>
    {children}
  </Layout>
)
