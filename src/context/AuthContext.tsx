
// auth/AuthContext.tsx or contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Export this interface so Navbar.tsx can import and use it for the 'user' prop type
export interface UserData {
    email: string | null;
    role_type: string | null;
    organization_id?: string | null; // Make it optional and allow null
}

interface AuthContextType {
    user: UserData;
    isAuthenticated: boolean;
    loading: boolean;
    // Updated login function to accept organization_id as an optional parameter
    login: (token: string, email: string, role_type: string, organization_id?: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Initialize organization_id to null
    const [user, setUser] = useState<UserData>({ email: null, role_type: null, organization_id: null });
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    // On initial load, check localStorage for token, email, role_type, and organization_id
    useEffect(() => {
        try {
            // const storedToken = localStorage.getItem('token');
            // const storedEmail = localStorage.getItem('email');
            // const storedRoleType = localStorage.getItem('role_type');
            // const storedOrganizationId = localStorage.getItem('organization_id');
            const storedToken = sessionStorage.getItem('token');
            const storedEmail = sessionStorage.getItem('email');
            const storedRoleType = sessionStorage.getItem('role_type');
            const storedOrganizationId = sessionStorage.getItem('organization_id');

            if (storedToken && storedEmail && storedRoleType) {
                setIsAuthenticated(true);
                setUser({
                    email: storedEmail,
                    role_type: storedRoleType,
                    // Set organization_id, or null if not present (e.g., for non-super_admin)
                    organization_id: storedOrganizationId || null,
                });
            } else {
                // If any piece is missing, treat as not authenticated and clear potentially stale data
                // localStorage.removeItem('token');
                // localStorage.removeItem('email');
                // localStorage.removeItem('role_type');
                // localStorage.removeItem('organization_id'); 
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('email');
                sessionStorage.removeItem('role_type');
                sessionStorage.removeItem('organization_id');
                setIsAuthenticated(false);
                setUser({ email: null, role_type: null, organization_id: null });
            }
        } catch (error) {
            console.error('Failed to retrieve data from localStorage:', error);
            // Clear potentially corrupted data
            // localStorage.removeItem('token');
            // localStorage.removeItem('email');
            // localStorage.removeItem('role_type');
            // localStorage.removeItem('organization_id'); 
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('email');
            sessionStorage.removeItem('role_type');
            sessionStorage.removeItem('organization_id');
            setIsAuthenticated(false);
            setUser({ email: null, role_type: null, organization_id: null });
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        // localStorage.removeItem('token');
        // localStorage.removeItem('email');
        // localStorage.removeItem('role_type');
        // localStorage.removeItem('organization_id'); 
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('email');
        sessionStorage.removeItem('role_type');
        sessionStorage.removeItem('organization_id');
        // Clear the cookie by setting its expiry to a past date
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax;';

        setUser({ email: null, role_type: null, organization_id: null }); // Reset user state
        setIsAuthenticated(false);

        // Manipulate browser history directly to clear the stack
        if (window.history.pushState) {
            window.history.pushState({}, '', '/');
            router.replace('/');
        } else {
            router.replace('/');
        }
    }, [router]);

    // Auto-detect if localStorage token, email, or role_type is deleted externally
    useEffect(() => {
        const handleStorageChange = () => {
            // const token = localStorage.getItem('token');
            // const email = localStorage.getItem('email');
            // const role_type = localStorage.getItem('role_type');
            // const organization_id = localStorage.getItem('organization_id'); 

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
                // Update user with organization_id, ensuring it's null if not present
                setUser({ email, role_type, organization_id: organization_id || null });
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [isAuthenticated, logout]);

    // Updated login function to accept organization_id
    const login = (token: string, email: string, role_type: string, organization_id?: string) => {
        // localStorage.setItem('token', token);
        // localStorage.setItem('email', email);
        // localStorage.setItem('role_type', role_type);
        // if (organization_id) {
        //     localStorage.setItem('organization_id', organization_id);
        // } else {
        //     localStorage.removeItem('organization_id');
        // }
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('email', email);
        sessionStorage.setItem('role_type', role_type);
        if (organization_id) {
            sessionStorage.setItem('organization_id', organization_id);
        } else {
            sessionStorage.removeItem('organization_id');
        }

        // Set a cookie for the token
        document.cookie = `token=${token}; path=/; max-age=86400; SameSite=Lax;`;

        // Update user state, including organization_id (ensuring null if not provided)
        setUser({ email, role_type, organization_id: organization_id || null });
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