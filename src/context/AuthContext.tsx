
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UserData {
  email: string | null;
  role_type: string | null;
}

interface AuthContextType {
  user: UserData;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string, email: string, role_type: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData>({ email: null, role_type: null });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // On initial load, check localStorage for token, email, and role_type
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('token');
      const storedEmail = localStorage.getItem('email');
      const storedRoleType = localStorage.getItem('role_type');

      if (storedToken && storedEmail && storedRoleType) {
        setIsAuthenticated(true);
        setUser({
          email: storedEmail,
          role_type: storedRoleType,
        });
      } else {
        // If any piece is missing, treat as not authenticated and clear potentially stale data
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        localStorage.removeItem('role_type');
        setIsAuthenticated(false);
        setUser({ email: null, role_type: null });
      }
    } catch (error) {
      console.error('Failed to retrieve data from localStorage:', error);
      // Clear potentially corrupted data
      localStorage.removeItem('token');
      localStorage.removeItem('email');
      localStorage.removeItem('role_type');
      setIsAuthenticated(false);
      setUser({ email: null, role_type: null });
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('role_type');
    // Clear the cookie by setting its expiry to a past date
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;'; // Added SameSite

    setUser({ email: null, role_type: null });
    setIsAuthenticated(false);

    // IMPORTANT: Manipulate browser history directly to clear the stack
    // This makes sure the browser's back button doesn't reveal previous protected routes.
    
    if (window.history.pushState) {
      // Push an empty state for the home page, effectively clearing previous entries
      window.history.pushState({}, '', '/');
      // Then replace with the home route to synchronize Next.js router state
      router.replace('/');
    } else {
      // Fallback for older browsers (unlikely to be needed)
      router.replace('/');
    }
  }, [router]);

      //  window.location.replace('/');
  // }, []);

  // Auto-detect if localStorage token, email, or role_type is deleted externally
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('email');
      const role_type = localStorage.getItem('role_type');

      if (!token && isAuthenticated) {
        // If token is removed externally while authenticated, log out
        logout();
      } else if (token && (!email || !role_type)) {
        // If token exists but email/role_type are missing, something's wrong, log out
        logout();
      } else if (token && email && role_type && !isAuthenticated) {
        // If token and data exist but context is not authenticated (e.g., after direct page load/refresh)
        setIsAuthenticated(true);
        setUser({ email, role_type });
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Consider removing the setInterval if 'storage' events are sufficient for your needs.
    // If kept, use a longer interval for performance (e.g., 5000ms).
    // const interval = setInterval(handleStorageChange, 1000); 

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      // clearInterval(interval); 
    };
  }, [isAuthenticated, logout]); // `isAuthenticated` and the memoized `logout` are stable dependencies


  // Removed the redundant popstate listener from here.
  // It's handled more specifically in useProtectRoute.ts and by the middleware.

  const login = (token: string, email: string, role_type: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('email', email); // Store email in localStorage
    localStorage.setItem('role_type', role_type); // Store role_type in localStorage
    // Set a cookie for the token, if needed for server-side processing or other purposes
    document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax;`; // Added SameSite
    setUser({ email, role_type });
    setIsAuthenticated(true);
    // Note: The actual router.replace('/dashboard') is handled within AuthModal's onSubmit to control timing
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