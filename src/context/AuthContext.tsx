
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();

  // ✅ Check for token on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  // ✅ Auto-detect if localStorage token is deleted
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (!token && isAuthenticated) {
        setIsAuthenticated(false);
        router.replace('/');
      }
    }, 500); // check every 500ms

    return () => clearInterval(interval);
  }, [isAuthenticated, router]);

  // ✅ Block back/forward nav to dashboard if not logged in
  useEffect(() => {
    const handlePopState = () => {
      const token = localStorage.getItem('token');
      const currentPath = window.location.pathname;

      if (!token && currentPath.startsWith('/dashboard')) {
        router.replace('/');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [router]);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    document.cookie = `token=${token}; path=/; max-age=86400`;
    setIsAuthenticated(true);
    router.replace('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role_type');

    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    setIsAuthenticated(false);
    router.replace('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

