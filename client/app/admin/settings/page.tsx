import { Typography, Box, Paper } from '@mui/material';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default function AdminSettingsPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Settings page - Coming soon
        </Typography>
      </Paper>
    </Box>
  );
}

