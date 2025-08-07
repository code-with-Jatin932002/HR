'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
// Import your custom useAuth hook instead of AuthContext directly
import { useAuth } from '@/context/AuthContext'; // <--- CHANGE IS HERE

export default function useProtectRoute() {
  const router = useRouter();
  const pathname = usePathname();
  // Use the useAuth hook to get isAuthenticated and loading
  const { isAuthenticated, loading } = useAuth(); // <--- CHANGE IS HERE

  useEffect(() => {
    // This effect ensures client-side redirect if not authenticated and on a dashboard path
    if (!loading && !isAuthenticated && pathname.startsWith('/dashboard')) {
      router.replace('/');
    }
  }, [isAuthenticated, loading, router, pathname]);

  // This useEffect handles browser back/forward button clicks specifically.
  // It directly checks localStorage for immediate reaction to history navigation
  // after a logout, even if React state updates are slightly delayed.
  useEffect(() => {
    const handlePopState = () => {
      // const token = localStorage.getItem('token');
      const token = sessionStorage.getItem('token');

      const currentPath = window.location.pathname;
      if (!token && currentPath.startsWith('/dashboard')) {
        router.replace('/');
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);
}