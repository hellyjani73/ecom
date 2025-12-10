import { Typography, Box, Paper } from '@mui/material';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default function AdminOrdersPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Orders Management
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Orders management page - Coming soon
        </Typography>
      </Paper>
    </Box>
  );
}

