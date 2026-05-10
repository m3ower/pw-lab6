import { createContext, useContext, useEffect, useRef, useState } from 'react';

const AuthContext = createContext(null);

// This key is also read by src/api/client.js
export const AUTH_STORAGE_KEY = 'shelf-auth';

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      // Discard if already expired
      return parsed.expiresAt > Date.now() ? parsed : null;
    } catch {
      return null;
    }
  });

  const timerRef = useRef(null);

  // Auto-clear when token expires
  useEffect(() => {
    clearTimeout(timerRef.current);
    if (!auth) return;
    const msLeft = auth.expiresAt - Date.now();
    if (msLeft <= 0) { setAuth(null); return; }
    timerRef.current = setTimeout(() => {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      setAuth(null);
    }, msLeft);
    return () => clearTimeout(timerRef.current);
  }, [auth]);

  function setToken({ token, role, permissions, expiresIn }) {
    const data = { token, role, permissions, expiresAt: Date.now() + expiresIn * 1000 };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    setAuth(data);
  }

  function clearToken() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
  }

  function hasPermission(perm) {
    if (!auth) return false;
    if (auth.expiresAt <= Date.now()) return false;
    return auth.permissions.includes(perm);
  }

  return (
    <AuthContext.Provider value={{ auth, setToken, clearToken, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
