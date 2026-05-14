import { useCallback, useEffect, useMemo, useState } from 'react';
import { loginUser, registerUser } from '../api/auth.js';

const AUTH_STORAGE_KEY = 'traderhub:auth';
const AUTH_EVENT = 'traderhub:auth-change';

function readAuth() {
  try {
    const rawValue = localStorage.getItem(AUTH_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
}

function writeAuth(auth) {
  if (auth) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  window.dispatchEvent(new Event(AUTH_EVENT));
}

export default function useAuth() {
  const [auth, setAuth] = useState(() => readAuth());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function handleAuthChange(event) {
      if (!event.key || event.key === AUTH_STORAGE_KEY) {
        setAuth(readAuth());
      }
    }

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener(AUTH_EVENT, handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener(AUTH_EVENT, handleAuthChange);
    };
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);

    try {
      const nextAuth = await loginUser(credentials);
      writeAuth(nextAuth);
      setAuth(nextAuth);
      return nextAuth;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (account) => {
    setLoading(true);

    try {
      const nextAuth = await registerUser(account);
      writeAuth(nextAuth);
      setAuth(nextAuth);
      return nextAuth;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    writeAuth(null);
    setAuth(null);
  }, []);

  return useMemo(
    () => ({
      user: auth?.profile ?? null,
      tokens: auth?.tokens ?? null,
      isAuthenticated: Boolean(auth?.tokens?.access_token),
      loading,
      login,
      logout,
      register,
    }),
    [auth, loading, login, logout, register],
  );
}
