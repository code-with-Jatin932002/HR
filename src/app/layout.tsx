
// import './globals.css';
// import Navbar from '../components/Navbar';
// import Footer from '../components/Footer';

// export const metadata = {
//   title: 'HR Portal',
//   description: 'A simple HR management portal',
// };

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body className="min-h-screen flex flex-col">
//         <Navbar />
//         <main className="flex-grow">{children}</main>
//         <Footer />
//       </body>
//     </html>
//   );
// }


// import './globals.css';
// import Navbar from '../components/Navbar';
// import Footer from '../components/Footer';
// import { AuthProvider } from '../context/AuthContext'; // <-- NEW

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   return (
//     <html lang="en">
//       <body className="min-h-screen flex flex-col">
//         <AuthProvider>
//           <Navbar />
//           <main className="flex-grow">{children}</main>
//           <Footer />
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }



// 'use client';

// import './globals.css';
// import { usePathname } from 'next/navigation';
// import Navbar from '../components/Navbar';
// import Footer from '../components/Footer';
// import { AuthProvider } from '../context/AuthContext';

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname();
//   const isDashboard = pathname.startsWith('/dashboard'); // ✅ Check current route

//   return (
//     <html lang="en">
//       <body className="min-h-screen flex flex-col">
//         <AuthProvider>
//           <Navbar />
//           <main className="flex-grow">{children}</main>

//           {/* ✅ Show footer only if NOT in dashboard */}
//           {!isDashboard && <Footer />}
//         </AuthProvider>
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
