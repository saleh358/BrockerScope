const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5056';

export async function fetchApiQuery<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...init?.headers
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = errorText;

    try {
      const errorBody = JSON.parse(errorText) as { error?: string; title?: string };
      message = errorBody.error ?? errorBody.title ?? errorText;
    } catch {
      // The API may return plain text for framework-level errors.
    }

    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
