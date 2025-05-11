import { useState } from 'react';
import type { ReactNode } from 'react';
import { Box, useTheme, Toolbar } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const theme = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Header */}
      <Header toggleSidebar={toggleSidebar} />
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          bgcolor: theme.palette.background.default,
          minHeight: '100vh',
          overflow: 'auto'
        }}
      >
        <Toolbar /> {/* This creates space at the top equal to the header height */}
        {children}
      </Box>
    </Box>
  );
};

export default MainLayout; 