
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function useProtectRoute() {
  const router = useRouter();

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/');

      }
    };

    // Initial check
    checkToken();

    // Real-time token monitor (every 500ms)
    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        clearInterval(interval);
        router.replace('/');
      }
    }, 500);

    // Handle browser back/forward button
    const handlePopState = () => {
      const token = localStorage.getItem('token');
      const currentPath = window.location.pathname;
      if (!token && currentPath.startsWith('/dashboard')) {
        router.replace('/');
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);
}
