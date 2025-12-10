import { Typography, Box, Paper, Grid, Card, CardContent } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CategoryIcon from '@mui/icons-material/Category';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const stats = [
    { title: 'Total Products', value: '0', icon: <InventoryIcon />, color: '#1976d2' },
    { title: 'Total Categories', value: '0', icon: <CategoryIcon />, color: '#dc004e' },
    { title: 'Total Orders', value: '0', icon: <ShoppingCartIcon />, color: '#2e7d32' },
    { title: 'Total Users', value: '0', icon: <DashboardIcon />, color: '#ed6c02' },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Welcome to the admin panel. Manage your e-commerce store from here.
      </Typography>
      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ color: stat.color, mr: 1 }}>{stat.icon}</Box>
                  <Typography variant="h6" component="div">
                    {stat.value}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Use the sidebar to navigate to different sections of the admin panel.
        </Typography>
      </Paper>
    </Box>
  );
}

