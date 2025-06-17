
// 'use client';

// import './globals.css';
// import { usePathname } from 'next/navigation';
// import Navbar from '../components/Navbar';
// import Footer from '../components/Footer';
// import { AuthProvider } from '../context/AuthContext';
// import Providers from './providers'; // 👈 Import React Query Providers

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname();
//   const isDashboard = pathname.startsWith('/dashboard'); // ✅ Check current route

//   return (
//     <html lang="en">
//       <body className="min-h-screen flex flex-col">
//         <Providers> {/* ✅ React Query wrapper */}
//           <AuthProvider> {/* ✅ Your Auth context */}
//             <Navbar />
//             <main className="flex-grow">{children}</main>

//             {/* ✅ Footer hidden for /dashboard routes */}
//             {!isDashboard && <Footer />}
//           </AuthProvider>
//         </Providers>
//       </body>
//     </html>
//   );
// }



'use client';

import './globals.css';
import { usePathname } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthProvider } from '../context/AuthContext';
import Providers from './providers'; // 👈 Import React Query Providers

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard'); // ✅ Check current route

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Providers> {/* ✅ React Query wrapper */}
          <AuthProvider> {/* ✅ Your Auth context */}
            <Navbar />
            <main className="flex-grow">{children}</main>

            {/* ✅ Footer hidden for /dashboard routes */}
            {!isDashboard && <Footer />}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}