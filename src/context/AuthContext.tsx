// src/context/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface UserData {
    email: string | null;
    role_type: string | null;
    organization_id?: string | null;
    user_id?: string | null;
     first_name?: string | null;
    last_name?: string | null;
}

interface AuthContextType {
    user: UserData;
    isAuthenticated: boolean;
    loading: boolean;
    login: (
        token: string,
        email: string,
        role_type: string,
        user_id?: string,
        organization_id?: string,
        first_name?: string,
        last_name?: string
    ) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserData>({ email: null, role_type: null, organization_id: null, user_id: null , first_name: null,last_name: null, });
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();

    useEffect(() => {
        try {
            const storedToken = sessionStorage.getItem('token');
            const storedEmail = sessionStorage.getItem('email');
            const storedRoleType = sessionStorage.getItem('role_type');
            const storedOrganizationId = sessionStorage.getItem('organization_id');
            const storedUserId = sessionStorage.getItem('user_id');
            const storedFirstName = sessionStorage.getItem('first_name');
            const storedLastName = sessionStorage.getItem('last_name');
            if (storedToken && storedEmail && storedRoleType) {
                setIsAuthenticated(true);
                setUser({
                    email: storedEmail,
                    role_type: storedRoleType,
                    organization_id: storedOrganizationId || null,
                    user_id: storedUserId || null,
                    first_name: storedFirstName || null,
                    last_name: storedLastName || null,
                });
            } else {
                sessionStorage.clear();
                setIsAuthenticated(false);
                setUser({ email: null, role_type: null, organization_id: null, user_id: null, first_name: null, last_name: null });
            }
        } catch (error) {
            console.error('Failed to retrieve data from sessionStorage:', error);
            sessionStorage.clear();
            setIsAuthenticated(false);
            setUser({ email: null, role_type: null, organization_id: null, user_id: null, first_name: null,last_name: null });
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        sessionStorage.clear();
        setUser({ email: null, role_type: null, organization_id: null, user_id: null ,  first_name: null,last_name: null,
 });
        setIsAuthenticated(false);
        router.push('/');
    }, [router]);

    useEffect(() => {
        const handleStorageChange = () => {
            const token = sessionStorage.getItem('token');
            const email = sessionStorage.getItem('email');
            const role_type = sessionStorage.getItem('role_type');
            const organization_id = sessionStorage.getItem('organization_id');
            const user_id = sessionStorage.getItem('user_id');
            const first_name = sessionStorage.getItem('first_name');
            const last_name = sessionStorage.getItem('last_name');

            if (!token && isAuthenticated) {
                logout();
            } else if (token && (!email || !role_type)) {
                logout();
            } else if (token && email && role_type && !isAuthenticated) {
                setIsAuthenticated(true);
                setUser({ email, role_type, organization_id: organization_id || null, user_id: user_id || null, first_name: first_name || null,last_name: last_name || null });
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [isAuthenticated, logout]);

    const login = (token: string, email: string, role_type: string, user_id?: string, organization_id?: string, first_name?: string, last_name?: string) => {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('email', email);
        sessionStorage.setItem('role_type', role_type);

        if (user_id) {
            sessionStorage.setItem('user_id', user_id);
        } else {
            sessionStorage.removeItem('user_id');
        }

        if (organization_id) {
            sessionStorage.setItem('organization_id', organization_id);
        } else {
            sessionStorage.removeItem('organization_id');
        }
        if (first_name) {
            sessionStorage.setItem('first_name', first_name);
        } else {
            sessionStorage.removeItem('first_name');
        }

        if (last_name) {
            sessionStorage.setItem('last_name', last_name);
        } else {
            sessionStorage.removeItem('last_name');
        }

        setUser({ email, role_type, user_id: user_id || null, organization_id: organization_id || null, first_name: first_name || null,last_name: last_name || null });
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