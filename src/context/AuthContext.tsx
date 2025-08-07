'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface UserData {
  email: string | null;
  role_type: string | null;
  organization_id?: string | null;
}

interface AuthContextType {
  user: UserData;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, email: string, role_type: string, organization_id?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData>({ email: null, role_type: null, organization_id: null });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedToken = sessionStorage.getItem('token');
      const storedEmail = sessionStorage.getItem('email');
      const storedRoleType = sessionStorage.getItem('role_type');
      const storedOrganizationId = sessionStorage.getItem('organization_id');

      if (storedToken && storedEmail && storedRoleType) {
        setIsAuthenticated(true);
        setUser({
          email: storedEmail,
          role_type: storedRoleType,
          organization_id: storedOrganizationId || null,
        });
      } else {
        sessionStorage.clear();
        setIsAuthenticated(false);
        setUser({ email: null, role_type: null, organization_id: null });
      }
    } catch (error) {
      console.error('Failed to retrieve data from sessionStorage:', error);
      sessionStorage.clear();
      setIsAuthenticated(false);
      setUser({ email: null, role_type: null, organization_id: null });
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    // Clear sessionStorage for the current tab only
    sessionStorage.clear();

    setUser({ email: null, role_type: null, organization_id: null });
    setIsAuthenticated(false);

    if (window.history.pushState) {
      window.history.pushState({}, '', '/');
      router.replace('/');
    } else {
      router.replace('/');
    }
  }, [router]);

  useEffect(() => {
    const handleStorageChange = () => {
      const token = sessionStorage.getItem('token');
      const email = sessionStorage.getItem('email');
      const role_type = sessionStorage.getItem('role_type');
      const organization_id = sessionStorage.getItem('organization_id');

      if (!token && isAuthenticated) {
        logout();
      } else if (token && (!email || !role_type)) {
        logout();
      } else if (token && email && role_type && !isAuthenticated) {
        setIsAuthenticated(true);
        setUser({ email, role_type, organization_id: organization_id || null });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated, logout]);

  const login = (token: string, email: string, role_type: string, organization_id?: string) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('email', email);
    sessionStorage.setItem('role_type', role_type);
    if (organization_id) {
      sessionStorage.setItem('organization_id', organization_id);
    } else {
      sessionStorage.removeItem('organization_id');
    }

    setUser({ email, role_type, organization_id: organization_id || null });
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};