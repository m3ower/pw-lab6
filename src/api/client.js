const API_BASE = 'http://localhost:3001';
const TOKEN_KEY = 'shelf-jwt';

async function fetchToken() {
  const res = await fetch(`${API_BASE}/token?role=ADMIN`);
  const { token } = await res.json();
  localStorage.setItem(TOKEN_KEY, token);
  return token;
}

function getStoredToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Keep a 10s buffer before expiry
    if (payload.exp * 1000 > Date.now() + 10_000) return token;
  } catch { /* fall through */ }
  return null;
}

async function getToken() {
  return getStoredToken() ?? fetchToken();
}

export async function apiFetch(path, options = {}) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  // Token may have just expired — refresh and retry once
  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    const fresh = await fetchToken();
    return fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${fresh}`,
        ...options.headers,
      },
    });
  }
  return res;
}
