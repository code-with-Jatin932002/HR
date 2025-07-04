// src/hooks/useAuthRedirect.ts
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function useAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    // const token = localStorage.getItem('token');
    const token = sessionStorage.getItem('token');

    if (!token) {
      router.replace('/');
    }
  }, []);
}



