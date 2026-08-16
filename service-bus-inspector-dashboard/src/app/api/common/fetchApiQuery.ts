export const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://127.0.0.1:5056' : '');

export async function fetchApiQuery<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...init?.headers
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event('brokerscope:unauthorized'));
    }

    const errorText = await response.text();
    let message = errorText;

    try {
      const errorBody = JSON.parse(errorText) as {
        error?: string;
        title?: string;
        detail?: string;
        errors?: Record<string, string[]>;
      };
      const validationMessage = errorBody.errors
        ? Object.values(errorBody.errors).flat().join(' ')
        : undefined;
      message = errorBody.error ?? validationMessage ?? errorBody.detail ?? errorBody.title ?? errorText;
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
