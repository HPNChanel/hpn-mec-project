import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  LightMode as LightIcon,
  DarkMode as DarkIcon,
  FormatSize as FontSizeIcon,
  Language as LanguageIcon,
  Save as SaveIcon,
  Refresh as ResetIcon
} from '@mui/icons-material';
import { useColorMode } from '../../theme/ThemeContext';

// Define types
type FontSize = 'small' | 'medium' | 'large';
type Language = 'vi' | 'en';

// Font size options with their CSS values
const fontSizeOptions: Record<FontSize, Record<string, string>> = {
  small: {
    body1: '0.875rem',
    body2: '0.75rem',
    h4: '1.4rem',
    h5: '1.15rem',
    h6: '0.9rem'
  },
  medium: {
    body1: '1rem',
    body2: '0.875rem',
    h4: '1.5rem',
    h5: '1.25rem',
    h6: '1rem'
  },
  large: {
    body1: '1.125rem',
    body2: '1rem',
    h4: '1.75rem',
    h5: '1.5rem',
    h6: '1.25rem'
  }
};

const Settings = () => {
  const { mode, toggleColorMode } = useColorMode();

  // State for settings
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [language, setLanguage] = useState<Language>('vi');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem('font-size');
    if (savedFontSize && ['small', 'medium', 'large'].includes(savedFontSize)) {
      setFontSize(savedFontSize as FontSize);
    }

    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && ['vi', 'en'].includes(savedLanguage)) {
      setLanguage(savedLanguage as Language);
    }
  }, []);

  // Apply font size changes
  useEffect(() => {
    // Apply font size to root element
    const root = document.documentElement;
    const sizes = fontSizeOptions[fontSize];
    
    Object.entries(sizes).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });
  }, [fontSize]);

  // Handle theme change
  const handleThemeChange = () => {
    toggleColorMode();
  };

  // Handle font size change
  const handleFontSizeChange = (
    _event: React.MouseEvent<HTMLElement>,
    newFontSize: FontSize | null
  ) => {
    if (newFontSize) {
      setFontSize(newFontSize);
    }
  };

  // Handle language change
  const handleLanguageChange = (event: SelectChangeEvent) => {
    setLanguage(event.target.value as Language);
  };

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem('font-size', fontSize);
    localStorage.setItem('language', language);
    
    setNotification({
      open: true,
      message: language === 'vi' ? 'Đã lưu cài đặt thành công' : 'Settings saved successfully',
      severity: 'success'
    });
  };

  // Reset settings to defaults
  const resetSettings = () => {
    // Default values
    const defaultFontSize: FontSize = 'medium';
    const defaultLanguage: Language = 'vi';
    
    // Update state
    setFontSize(defaultFontSize);
    setLanguage(defaultLanguage);
    
    // Update localStorage
    localStorage.setItem('font-size', defaultFontSize);
    localStorage.setItem('language', defaultLanguage);
    
    // Reset theme to light if it's not already
    if (mode === 'dark') {
      toggleColorMode();
    }
    
    setNotification({
      open: true,
      message: defaultLanguage === 'vi' ? 'Đã khôi phục cài đặt mặc định' : 'Default settings restored',
      severity: 'success'
    });
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {language === 'vi' ? 'Cài đặt' : 'Settings'}
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          {/* Section 1: Interface */}
          <Typography variant="h5" gutterBottom>
            {language === 'vi' ? 'Giao diện' : 'Interface'}
          </Typography>
          
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {/* Theme Toggle */}
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
              <Typography variant="subtitle1" gutterBottom>
                {language === 'vi' ? 'Chế độ màu' : 'Theme Mode'}
              </Typography>
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={handleThemeChange}
                aria-label="theme mode"
                color="primary"
                fullWidth
              >
                <ToggleButton value="light" aria-label="light mode">
                  <LightIcon sx={{ mr: 1 }} />
                  {language === 'vi' ? 'Sáng' : 'Light'}
                </ToggleButton>
                <ToggleButton value="dark" aria-label="dark mode">
                  <DarkIcon sx={{ mr: 1 }} />
                  {language === 'vi' ? 'Tối' : 'Dark'}
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            
            {/* Font Size */}
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
              <Typography variant="subtitle1" gutterBottom>
                {language === 'vi' ? 'Cỡ chữ' : 'Font Size'}
              </Typography>
              <ToggleButtonGroup
                value={fontSize}
                exclusive
                onChange={handleFontSizeChange}
                aria-label="font size"
                color="primary"
                fullWidth
              >
                <ToggleButton value="small" aria-label="small font">
                  <FontSizeIcon sx={{ fontSize: '1rem', mr: 1 }} />
                  {language === 'vi' ? 'Nhỏ' : 'Small'}
                </ToggleButton>
                <ToggleButton value="medium" aria-label="medium font">
                  <FontSizeIcon sx={{ fontSize: '1.25rem', mr: 1 }} />
                  {language === 'vi' ? 'Vừa' : 'Medium'}
                </ToggleButton>
                <ToggleButton value="large" aria-label="large font">
                  <FontSizeIcon sx={{ fontSize: '1.5rem', mr: 1 }} />
                  {language === 'vi' ? 'Lớn' : 'Large'}
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          {/* Section 2: Language */}
          <Typography variant="h5" gutterBottom>
            {language === 'vi' ? 'Ngôn ngữ' : 'Language'}
          </Typography>
          
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
              <FormControl fullWidth>
                <InputLabel id="language-select-label">
                  {language === 'vi' ? 'Ngôn ngữ' : 'Language'}
                </InputLabel>
                <Select
                  labelId="language-select-label"
                  id="language-select"
                  value={language}
                  label={language === 'vi' ? 'Ngôn ngữ' : 'Language'}
                  onChange={handleLanguageChange}
                  startAdornment={<LanguageIcon sx={{ mr: 1 }} />}
                >
                  <MenuItem value="vi">Tiếng Việt</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {language === 'vi' 
                  ? 'Hỗ trợ đa ngôn ngữ sẽ được cập nhật trong thời gian tới' 
                  : 'Full multi-language support coming soon'}
              </Typography>
            </Box>
          </Box>
          
          {/* Actions */}
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button 
              variant="outlined" 
              color="primary"
              startIcon={<ResetIcon />}
              onClick={resetSettings}
            >
              {language === 'vi' ? 'Khôi phục mặc định' : 'Restore Defaults'}
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<SaveIcon />}
              onClick={saveSettings}
            >
              {language === 'vi' ? 'Lưu thay đổi' : 'Save Changes'}
            </Button>
          </Box>
        </Paper>
      </Box>
      
      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings; 