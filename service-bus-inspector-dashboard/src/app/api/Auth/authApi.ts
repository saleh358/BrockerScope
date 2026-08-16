import { apiBaseUrl, fetchApiQuery } from '../common/fetchApiQuery';

export type AuthStatus = {
  authenticated: boolean;
  email: string | null;
  setupRequired: boolean;
};

export async function getAuthStatus(): Promise<AuthStatus> {
  const response = await fetch(`${apiBaseUrl}/api/auth/status`, {
    credentials: 'include',
    headers: { Accept: 'application/json' }
  });

  if (!response.ok) {
    throw new Error('Could not check the authentication status.');
  }

  return (await response.json()) as AuthStatus;
}

export function registerAccount(email: string, password: string) {
  return fetchApiQuery<AuthStatus>('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
}

export function login(email: string, password: string, rememberMe: boolean) {
  return fetchApiQuery<AuthStatus>('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, rememberMe })
  });
}

export function logout() {
  return fetchApiQuery<void>('/api/auth/logout', { method: 'POST' });
}
