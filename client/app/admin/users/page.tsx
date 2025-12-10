import { Typography, Box, Paper } from '@mui/material';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default function AdminUsersPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Users Management
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Users management page - Coming soon
        </Typography>
      </Paper>
    </Box>
  );
}

