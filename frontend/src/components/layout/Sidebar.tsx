import { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  useTheme,
  Collapse,
  Typography,
  Tooltip,
  alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  HealthAndSafety as HealthIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  ExpandLess,
  ExpandMore,
  Logout as LogoutIcon,
  AddCircleOutline as AddIcon,
  BarChart as ChartIcon,
  Settings as SettingsIcon,
  Timeline as TimelineIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Define sidebar width
const drawerWidth = 240;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [healthSubmenuOpen, setHealthSubmenuOpen] = useState(false);
  
  // Automatically open submenu when on a page within that category
  useEffect(() => {
    if (location.pathname.includes('/health')) {
      setHealthSubmenuOpen(true);
    }
  }, [location.pathname]);

  const handleNavigation = (path: string) => {
    navigate(path);
    if (window.innerWidth < theme.breakpoints.values.sm) {
      onClose();
    }
  };

  const toggleHealthSubmenu = () => {
    setHealthSubmenuOpen(!healthSubmenuOpen);
  };

  // Determine if a path is active (exact match or starts with path for nested routes)
  const isActivePath = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Define navigation items
  const mainNavItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      description: 'View your health overview'
    },
    {
      text: 'Health Records',
      icon: <HealthIcon />,
      hasSubmenu: true,
      description: 'Manage your health records',
      submenuItems: [
        { 
          text: 'Dashboard', 
          path: '/health-records',
          icon: <ChartIcon fontSize="small" />,
          description: 'View your health dashboard'
        },
        { 
          text: 'History', 
          path: '/health-history',
          icon: <TimelineIcon fontSize="small" />,
          description: 'View health history timeline'
        },
        { 
          text: 'Calendar', 
          path: '/calendar',
          icon: <CalendarTodayIcon fontSize="small" />,
          description: 'View health records calendar'
        },
        { 
          text: 'Add New Record', 
          path: '/health-form',
          icon: <AddIcon fontSize="small" />,
          description: 'Add a new health measurement'
        }
      ]
    },
    {
      text: 'Profile',
      icon: <PersonIcon />,
      path: '/profile',
      description: 'Manage your personal information'
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
      description: 'Application preferences'
    },
  ];

  // Admin-only navigation items
  const adminNavItems = [
    {
      text: 'Admin Panel',
      icon: <AdminIcon />,
      path: '/admin',
      description: 'User and system management'
    },
    {
      text: 'Analytics',
      icon: <ChartIcon />,
      path: '/analytics',
      description: 'View system analytics and statistics'
    },
  ];

  // Type guard to ensure path is a string
  const getPath = (path: string | undefined): string => {
    return path || '/';
  };

  // Active item styling
  const activeItemStyle = {
    bgcolor: alpha(theme.palette.primary.main, 0.1),
    borderRight: `3px solid ${theme.palette.primary.main}`,
    '&:hover': {
      bgcolor: alpha(theme.palette.primary.main, 0.2),
    }
  };

  // Drawer content
  const drawerContent = (
    <>
      <Box sx={{ 
        height: 64, // Same as AppBar height for alignment
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        color: theme.palette.primary.main
      }}>
        <HealthIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
        <Typography 
          variant="h6" 
          component="div" 
          color="primary.main" 
          fontWeight="500"
          noWrap
        >
          Health Panel
        </Typography>
      </Box>
      
      <Divider />
      
      <List component="nav" sx={{ px: 1 }}>
        {mainNavItems.map((item) => (
          item.hasSubmenu ? (
            <Box key={item.text}>
              <Tooltip title={item.description} placement="right" arrow>
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={toggleHealthSubmenu}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      ...(healthSubmenuOpen && activeItemStyle)
                    }}
                  >
                    <ListItemIcon sx={{ 
                      minWidth: 40,
                      color: healthSubmenuOpen ? 'primary.main' : 'inherit'
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{
                        fontWeight: healthSubmenuOpen ? 'medium' : 'regular'
                      }}
                    />
                    {healthSubmenuOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
              </Tooltip>
              <Collapse in={healthSubmenuOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.submenuItems.map((subItem) => (
                    <Tooltip key={subItem.text} title={subItem.description} placement="right" arrow>
                      <ListItem disablePadding>
                        <ListItemButton 
                          sx={{ 
                            pl: 4,
                            borderRadius: 1,
                            mb: 0.5,
                            ml: 1,
                            ...(isActivePath(getPath(subItem.path)) && activeItemStyle)
                          }}
                          onClick={() => handleNavigation(getPath(subItem.path))}
                        >
                          <ListItemIcon sx={{ 
                            minWidth: 35, 
                            color: isActivePath(getPath(subItem.path)) ? 'primary.main' : 'inherit'
                          }}>
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText 
                            primary={subItem.text} 
                            primaryTypographyProps={{
                              fontSize: '0.875rem',
                              fontWeight: isActivePath(getPath(subItem.path)) ? 'medium' : 'regular'
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    </Tooltip>
                  ))}
                </List>
              </Collapse>
            </Box>
          ) : (
            <Tooltip key={item.text} title={item.description} placement="right" arrow>
              <ListItem disablePadding>
                <ListItemButton 
                  onClick={() => handleNavigation(getPath(item.path))}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    ...(isActivePath(getPath(item.path)) && activeItemStyle)
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 40, 
                    color: isActivePath(getPath(item.path)) ? 'primary.main' : 'inherit'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{
                      fontWeight: isActivePath(getPath(item.path)) ? 'medium' : 'regular'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </Tooltip>
          )
        ))}
      </List>
      
      <Divider />
      
      {user?.role === 'admin' && (
        <>
          <List sx={{ px: 1 }}>
            {adminNavItems.map((item) => (
              <Tooltip key={item.text} title={item.description} placement="right" arrow>
                <ListItem disablePadding>
                  <ListItemButton 
                    onClick={() => handleNavigation(getPath(item.path))}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      ...(isActivePath(getPath(item.path)) && activeItemStyle)
                    }}
                  >
                    <ListItemIcon sx={{ 
                      minWidth: 40,
                      color: isActivePath(getPath(item.path)) ? 'primary.main' : 'inherit'
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: isActivePath(getPath(item.path)) ? 'medium' : 'regular'
                      }}
                      secondary="Admin area"
                      secondaryTypographyProps={{
                        fontSize: '0.7rem',
                        color: theme.palette.error.main
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </Tooltip>
            ))}
          </List>
          <Divider />
        </>
      )}
      
      <List sx={{ px: 1, mt: 'auto' }}>
        <ListItem disablePadding>
          <ListItemButton 
            onClick={() => handleNavigation('/login')}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              color: theme.palette.error.main
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: 40,
              color: theme.palette.error.main
            }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <>
      {/* Mobile drawer (temporary) */}
      <Drawer
        variant="temporary"
        open={isOpen}
        onClose={onClose}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: 'none',
            boxShadow: 3
          },
        }}
      >
        {drawerContent}
      </Drawer>
      
      {/* Desktop drawer (permanent) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.background.default
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar; 