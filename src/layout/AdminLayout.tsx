import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const linkStyle = ({ isActive }: { isActive: boolean }) => ({
  textDecoration: 'none',
  color: 'inherit',
  fontWeight: isActive ? 700 : 500,
});

export function AdminLayout() {
  const admin = useAuthStore((s) => s.admin);
  const clear = useAuthStore((s) => s.clear);
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            NewAdv Admin
          </Typography>
          <NavLink to="/" style={linkStyle}>
            Dashboard
          </NavLink>
          <NavLink to="/advocates" style={linkStyle}>
            Advocates
          </NavLink>
          <NavLink to="/settings" style={linkStyle}>
            Settings
          </NavLink>
          <Typography variant="body2" sx={{ opacity: 0.9, ml: 2 }}>
            {admin?.email}
          </Typography>
          <Button
            color="inherit"
            onClick={() => {
              clear();
              navigate('/login');
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}

