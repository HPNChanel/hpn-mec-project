import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import type { PaletteMode } from '@mui/material';

// Context for color mode
interface ColorModeContextType {
  mode: PaletteMode;
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextType>({
  mode: 'light',
  toggleColorMode: () => {},
});

// Soft color palette for both modes
const lightPalette = {
  primary: {
    main: '#3f7eb3',
    light: '#6ba7d1',
    dark: '#2a5a85',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#7c5295',
    light: '#9c79b1',
    dark: '#5d3872',
    contrastText: '#ffffff',
  },
  success: {
    main: '#4caf50',
    light: '#80e27e',
    dark: '#087f23',
  },
  error: {
    main: '#e57373',
    light: '#ffcdd2',
    dark: '#af4448',
  },
  warning: {
    main: '#ffb74d',
    light: '#ffe97d',
    dark: '#c88719',
  },
  info: {
    main: '#64b5f6',
    light: '#9be7ff',
    dark: '#2286c3',
  },
  background: {
    default: '#f8f9fa',
    paper: '#ffffff',
  },
  text: {
    primary: '#2c3e50',
    secondary: '#5d6d7e',
  },
};

const darkPalette = {
  primary: {
    main: '#5d9ad1',
    light: '#90caf9',
    dark: '#3a6896',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#9d7faf',
    light: '#cea8e6',
    dark: '#6c5780',
    contrastText: '#ffffff',
  },
  success: {
    main: '#66bb6a',
    light: '#98ee99',
    dark: '#338a3e',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
  },
  warning: {
    main: '#ffa726',
    light: '#ffb74d',
    dark: '#f57c00',
  },
  info: {
    main: '#29b6f6',
    light: '#4fc3f7',
    dark: '#0288d1',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  text: {
    primary: '#e1e5ea',
    secondary: '#b0bec5',
  },
};

// Vietnamese font-friendly typography configuration
const getTypography = () => ({
  fontFamily: [
    'Inter',
    'Roboto',
    'Arial',
    'sans-serif',
    '"Noto Sans"',
    '"Noto Sans Vietnamese"',
  ].join(','),
  h1: {
    fontWeight: 600,
    fontSize: '2.5rem',
    lineHeight: 1.2,
  },
  h2: {
    fontWeight: 600,
    fontSize: '2rem',
    lineHeight: 1.3,
  },
  h3: {
    fontWeight: 500,
    fontSize: '1.75rem',
    lineHeight: 1.3,
  },
  h4: {
    fontWeight: 500,
    fontSize: '1.5rem',
    lineHeight: 1.4,
  },
  h5: {
    fontWeight: 500,
    fontSize: '1.25rem',
    lineHeight: 1.4,
  },
  h6: {
    fontWeight: 500,
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  subtitle1: {
    fontWeight: 500,
    fontSize: '1rem',
  },
  subtitle2: {
    fontWeight: 500,
    fontSize: '0.875rem',
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  button: {
    fontWeight: 500,
  },
});

// Theme Provider Component
interface ThemeContextProviderProps {
  children: ReactNode;
}

export const ThemeContextProvider = ({ children }: ThemeContextProviderProps) => {
  // Get stored theme preference or use system preference
  const getInitialMode = (): PaletteMode => {
    const savedMode = localStorage.getItem('theme-mode');
    if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
      return savedMode;
    }
    
    // Use system preference as fallback
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  };

  const [mode, setMode] = useState<PaletteMode>(getInitialMode);

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  // Color mode toggle handler
  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [mode]
  );

  // Generate theme based on mode
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light' ? lightPalette : darkPalette),
        },
        typography: getTypography(),
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: `
              @font-face {
                font-family: 'Noto Sans Vietnamese';
                font-style: normal;
                font-display: swap;
                font-weight: 400;
                src: url(https://fonts.gstatic.com/s/notosans/v28/o-0IIpQlx3QUlC5A4PNr5TRASf6M7Q.woff2) format('woff2');
                unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB;
              }
              
              html {
                height: 100%;
                scroll-behavior: smooth;
              }
              
              body {
                height: 100%;
                margin: 0;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              }
              
              #root {
                height: 100%;
              }
              
              ::-webkit-scrollbar {
                width: 8px;
                height: 8px;
              }
              
              ::-webkit-scrollbar-track {
                background: ${mode === 'light' ? '#f1f1f1' : '#2d2d2d'};
              }
              
              ::-webkit-scrollbar-thumb {
                background: ${mode === 'light' ? '#c1c1c1' : '#555'};
                border-radius: 4px;
              }
              
              ::-webkit-scrollbar-thumb:hover {
                background: ${mode === 'light' ? '#a8a8a8' : '#777'};
              }
            `,
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 500,
                boxShadow: 'none',
                ':hover': {
                  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
                borderRadius: 12,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

// Hook to use the color mode
export const useColorMode = () => useContext(ColorModeContext); 