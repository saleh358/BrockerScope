import { FormEvent, useState } from 'react';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { AuthStatus, login, registerAccount } from '../../api/Auth/authApi';

type Props = {
  setupRequired: boolean;
  onAuthenticated: (status: AuthStatus) => void;
};

export default function LoginPage({ setupRequired, onAuthenticated }: Props) {
  const [registering, setRegistering] = useState(setupRequired);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (registering && password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const status = registering
        ? await registerAccount(email, password)
        : await login(email, password, rememberMe);
      onAuthenticated(status);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ alignItems: 'center', display: 'flex', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack alignItems="center" spacing={2.5}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Box textAlign="center">
              <Typography variant="h5">{registering ? 'Create account' : 'Sign in'}</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75 }} variant="body2">
                {registering
                  ? 'Your connections and Service Bus data will be private to your account.'
                  : 'Sign in to access Service Bus connections and messages.'}
              </Typography>
            </Box>

            <Box component="form" onSubmit={submit} sx={{ width: '100%' }}>
              <Stack spacing={2}>
                {error && <Alert severity="error">{error}</Alert>}
                <TextField
                  autoComplete="email"
                  autoFocus
                  fullWidth
                  label="Email"
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  type="email"
                  value={email}
                />
                <TextField
                  autoComplete={registering ? 'new-password' : 'current-password'}
                  fullWidth
                  helperText={
                    registering
                      ? 'At least 10 characters with uppercase, lowercase, number, and symbol.'
                      : undefined
                  }
                  label="Password"
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  type="password"
                  value={password}
                />
                {registering && (
                  <TextField
                    autoComplete="new-password"
                    fullWidth
                    label="Confirm password"
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    type="password"
                    value={confirmPassword}
                  />
                )}
                {!registering && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(event) => setRememberMe(event.target.checked)}
                      />
                    }
                    label="Keep me signed in"
                  />
                )}
                <Button disabled={submitting} size="large" type="submit" variant="contained">
                  {submitting ? (
                    <CircularProgress color="inherit" size={24} />
                  ) : registering ? (
                    'Create account'
                  ) : (
                    'Sign in'
                  )}
                </Button>
                <Button
                  disabled={submitting}
                  onClick={() => {
                    setRegistering((current) => !current);
                    setPassword('');
                    setConfirmPassword('');
                    setError(null);
                  }}
                >
                  {registering ? 'Already have an account? Sign in' : 'New here? Create an account'}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
