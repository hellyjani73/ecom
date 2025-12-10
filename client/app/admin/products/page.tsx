import { Typography, Box, Paper } from '@mui/material';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default function AdminProductsPage() {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Products Management
      </Typography>
      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="body1" color="text.secondary">
          Products management page - Coming soon
        </Typography>
      </Paper>
    </Box>
  );
}

