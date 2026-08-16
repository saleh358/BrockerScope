import { useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, CssBaseline, PaletteMode, ThemeProvider, createTheme } from '@mui/material';
import { AuthStatus, getAuthStatus, logout } from './api/Auth/authApi';
import { apiBaseUrl } from './api/common/fetchApiQuery';
import ServiceBusDashboard from './main/pages/ServiceBusDashboard';
import LoginPage from './main/pages/LoginPage';

export default function App() {
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [colorMode, setColorMode] = useState<PaletteMode>(() => {
    const savedMode = localStorage.getItem('brokerscope-color-mode');
    if (savedMode === 'light' || savedMode === 'dark') return savedMode;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    void getAuthStatus()
      .then(setAuthStatus)
      .catch(() => setAuthStatus({ authenticated: false, email: null, setupRequired: false }));

    const handleUnauthorized = () =>
      setAuthStatus((current) => ({
        authenticated: false,
        email: null,
        setupRequired: current?.setupRequired ?? false
      }));
    window.addEventListener('brokerscope:unauthorized', handleUnauthorized);

    return () => window.removeEventListener('brokerscope:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    if (!authStatus?.authenticated) return;

    const heartbeatUrl = `${apiBaseUrl}/api/session/heartbeat`;
    const sendHeartbeat = () => {
      void fetch(heartbeatUrl, { credentials: 'include', method: 'POST', keepalive: true }).catch(
        () => undefined
      );
    };

    sendHeartbeat();
    const heartbeatTimer = window.setInterval(sendHeartbeat, 15_000);

    return () => window.clearInterval(heartbeatTimer);
  }, [authStatus?.authenticated]);

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

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setAuthStatus({ authenticated: false, email: null, setupRequired: false });
    }
  }

  let content;
  if (!authStatus) {
    content = (
      <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  } else if (!authStatus.authenticated) {
    content = <LoginPage setupRequired={authStatus.setupRequired} onAuthenticated={setAuthStatus} />;
  } else {
    content = (
      <ServiceBusDashboard
        colorMode={colorMode}
        email={authStatus.email ?? ''}
        onLogout={handleLogout}
        onToggleColorMode={() => setColorMode((current) => (current === 'light' ? 'dark' : 'light'))}
      />
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {content}
    </ThemeProvider>
  );
}
