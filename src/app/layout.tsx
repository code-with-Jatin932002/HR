// src/app/layout.tsx
'use client';

import './globals.css';
import { usePathname } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthProvider } from '../context/AuthContext';
import { TimeTrackerProvider } from '../context/TimeTrackerContext'; // Import the new provider
import Providers from './providers';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <html lang="en">
      <body className="h-screen flex flex-col">
        <Providers>
          <AuthProvider>
            <TimeTrackerProvider>
              <Navbar />
              <main className="flex-grow overflow-y-auto">
                {children}
                {!isDashboard && <Footer />}
              </main>
              <Toaster position="top-center" reverseOrder={false} />
            </TimeTrackerProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}