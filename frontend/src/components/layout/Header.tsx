import { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box, 
  Menu, 
  MenuItem, 
  useTheme,
  Avatar,
  Tooltip,
  Divider,
  Badge,
  Chip
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { useColorMode } from '../../theme/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const { mode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.name) return '?';
    
    const nameParts = user.name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (
      nameParts[0].charAt(0).toUpperCase() + 
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  // Get avatar background color based on user role
  const getAvatarColor = () => {
    return user?.role === 'admin' ? theme.palette.error.main : theme.palette.primary.main;
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: theme.zIndex.drawer + 1,
        boxShadow: 1,
        backgroundImage: 'none', // Flat design
      }}
      color="primary"
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={toggleSidebar}
          sx={{ mr: 2, display: { xs: 'block', sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontWeight: 500
          }}
        >
          HPN Medical Health System
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Theme toggle with tooltip */}
          <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
            <IconButton 
              color="inherit" 
              onClick={toggleColorMode}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { 
                  bgcolor: 'rgba(255,255,255,0.2)' 
                },
                transition: 'all 0.2s'
              }}
            >
              {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          
          {/* Notifications icon */}
          <Tooltip title="Notifications">
            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* User information */}
          {user && (
            <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
              <Box sx={{ mr: 1, display: { xs: 'none', md: 'block' } }}>
                <Typography variant="body2" component="span">
                  {user.name}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="inherit" 
                  sx={{ display: 'block', opacity: 0.8 }}
                >
                  {user.role}
                </Typography>
              </Box>
              
              <Tooltip title="Account settings">
                <IconButton
                  onClick={handleProfileMenu}
                  size="small"
                  sx={{ p: 0 }}
                >
                  <Avatar 
                    sx={{ 
                      bgcolor: getAvatarColor(),
                      width: 40, 
                      height: 40
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>
          )}
          
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{
              elevation: 2,
              sx: {
                mt: 1.5,
                minWidth: 180,
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.2))',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
          >
            {user && (
              <Box sx={{ px: 2, py: 1.5, display: { xs: 'block', md: 'none' } }}>
                <Typography variant="subtitle1">{user.name}</Typography>
                <Chip 
                  label={user.role} 
                  size="small" 
                  color={user.role === 'admin' ? 'error' : 'primary'}
                  sx={{ mt: 0.5 }}
                />
              </Box>
            )}
            
            {user && <Divider sx={{ display: { xs: 'block', md: 'none' } }} />}
            
            <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
              My Profile
            </MenuItem>
            <MenuItem onClick={() => { handleClose(); navigate('/health-form'); }}>
              Add Health Record
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 