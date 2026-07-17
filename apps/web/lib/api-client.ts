/**
 * Standard client wrapper for server-side API requests.
 */
export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  // Automatically attach authorization token if present in localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => 'Unknown API Error');
    let errorMsg = text;
    try {
      const parsed = JSON.parse(text);
      if (parsed.message) {
        errorMsg = parsed.message;
      } else if (parsed.error) {
        errorMsg = parsed.error;
      } else if (parsed.data && parsed.data.message) {
        errorMsg = parsed.data.message;
      }
    } catch {
      // Fallback to raw text if not JSON
    }
    throw new Error(errorMsg || `API Error [${response.status}]`);
  }

  // Handle case where response body is empty or success message
  const text = await response.text();
  if (!text) {
    return {} as T;
  }

  try {
    const data = JSON.parse(text);
    // Standard unboxing of Express response structure: { status: 'success', data: ... }
    if (data && data.status === 'success' && data.data !== undefined) {
      return data.data as T;
    }
    return data as T;
  } catch {
    return text as unknown as T;
  }
}
