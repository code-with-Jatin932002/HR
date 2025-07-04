// src/app/layout.tsx
'use client';

import './globals.css';
import { usePathname } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthProvider } from '../context/AuthContext';
import Providers from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <html lang="en">
      {/* The body itself is the flex container for the entire app layout */}
      <body className="h-screen flex flex-col"> {/* No overflow-hidden here, as main will handle it */}
        <Providers>
          <AuthProvider>
            <Navbar /> {/* Navbar is fixed at the top */}
            
            {/* This main element will be the primary scrollable area for ALL content,
                except for the dashboard where its internal layout will manage its own. */}
            <main className="flex-grow overflow-y-auto"> {/* This now handles the main scroll */}
              {children}
              {!isDashboard && <Footer />}
            </main>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}