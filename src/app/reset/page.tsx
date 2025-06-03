// app/reset/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, []);

  return null;
}
