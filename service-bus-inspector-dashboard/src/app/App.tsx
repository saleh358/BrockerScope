import { useEffect, useMemo, useState } from 'react';
import { CssBaseline, PaletteMode, ThemeProvider, createTheme } from '@mui/material';
import ServiceBusDashboard from './main/pages/ServiceBusDashboard';

export default function App() {
  const [colorMode, setColorMode] = useState<PaletteMode>(() => {
    const savedMode = localStorage.getItem('brokerscope-color-mode');
    if (savedMode === 'light' || savedMode === 'dark') return savedMode;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('brokerscope-color-mode', colorMode);
  }, [colorMode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: colorMode,
          primary: { main: colorMode === 'dark' ? '#60a5fa' : '#2563eb' },
          background:
            colorMode === 'dark'
              ? { default: '#000000', paper: '#121212' }
              : { default: '#f5f7fb', paper: '#ffffff' }
        },
        ...(colorMode === 'dark' && {
          components: {
            MuiPaper: {
              styleOverrides: {
                root: { backgroundImage: 'none' }
              }
            }
          }
        }),
        shape: { borderRadius: 8 },
        typography: {
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        }
      }),
    [colorMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ServiceBusDashboard
        colorMode={colorMode}
        onToggleColorMode={() => setColorMode((current) => (current === 'light' ? 'dark' : 'light'))}
      />
    </ThemeProvider>
  );
}
