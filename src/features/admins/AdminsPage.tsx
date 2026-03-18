import { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';

import { AdminsTab } from './AdminsTab';
import { CreateAdminTab } from './CreateAdminTab';

export function AdminsPage() {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Admins
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Admins" />
          <Tab label="Create Admin" />
        </Tabs>
      </Box>
      {tab === 0 && <AdminsTab />}
      {tab === 1 && <CreateAdminTab onCreated={() => setTab(0)} />}
    </Box>
  );
}
