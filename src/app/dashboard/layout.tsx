'use client';

import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import useProtectRoute from '@/hooks/useProtectRoute';
import Loader from '@/components/Loader'; // Import the Loader component
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  useProtectRoute();

  // Handles auth redirection
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) setAuthorized(true);
  }, []);

  if (!authorized) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-600 text-lg">
        <Loader /> {/* Use the Loader component here */}
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 bg-gray-50 relative overflow-y-auto">
        <Breadcrumb />
        {children}
      </main>
    </div>
  );
}