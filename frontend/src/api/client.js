export function getTokens() {
  try {
    const raw = localStorage.getItem('authTokens');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setTokens(tokens) {
  if (!tokens) {
    localStorage.removeItem('authTokens');
    return;
  }
  localStorage.setItem('authTokens', JSON.stringify(tokens));
}

export async function apiFetch(path, { method = 'GET', body, headers = {} } = {}) {
  const tokens = getTokens();
  const finalHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };
  if (tokens?.access) {
    finalHeaders['Authorization'] = `Bearer ${tokens.access}`;
  }
  const res = await fetch(path, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;
  if (!res.ok) {
    const detail = data?.detail || res.statusText;
    throw new Error(detail);
  }
  return data;
}

