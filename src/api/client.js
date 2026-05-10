const API_BASE = 'http://localhost:3001';
const AUTH_STORAGE_KEY = 'shelf-auth'; // written by AuthContext

function getToken() {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) return null;
    const { token, expiresAt } = JSON.parse(stored);
    // Keep a 5s buffer so we don't send a token that expires mid-request
    return expiresAt > Date.now() + 5_000 ? token : null;
  } catch {
    return null;
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  if (!token) throw new Error('NO_TOKEN');

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  return res;
}
