
'use client';
import Sidebar from '@/components/Sidebar';
import useProtectRoute from '@/hooks/useProtectRoute';
import { useEffect, useState } from 'react';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  useProtectRoute();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setAuthorized(true);
  }, []);

  if (!authorized) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-600 text-lg">
        Redirecting...
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
        {children}
      </main>
    </div>
  );
}



