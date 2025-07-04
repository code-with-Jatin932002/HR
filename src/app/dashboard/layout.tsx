
// // dashboard/layout.tsx
// 'use client';

// import Sidebar from '@/components/Sidebar';
// import Breadcrumb from '@/components/Breadcrumb';
// import useProtectRoute from '@/hooks/useProtectRoute';
// import { useEffect, useState } from 'react';

// export default function DashboardLayout({ children }: { children: React.ReactNode }) {
//   const [authorized, setAuthorized] = useState(false);
//   useProtectRoute();

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) setAuthorized(true);
//   }, []);

//   if (!authorized) {
//     return (
//       <div className="w-full h-screen flex items-center justify-center text-gray-600 text-lg">
//         Redirecting...
//       </div>
//     );
//   }

//   return (
//     // The h-screen on this div is fine, as it's within the main app structure.
//     // The overflow will be managed by the parent 'main' in app/layout.tsx
//     <div className="h-screen flex"> {/* [cite: 17] */}
//       {/* Sidebar on the left */}
//       <Sidebar />

//       {/* Main content on the right. Remove overflow-y-auto here. */}
//       {/* The content within this main will now push the scrollbar of the parent `main` in src/app/layout.tsx */}
//       <main className="flex-1 p-4 sm:p-6 bg-gray-50 relative"> {/*  Removed overflow-y-auto */}
//         <Breadcrumb />
//         {/* Page-specific content */}
//         {children}
//       </main>
//     </div>
//   );
// }

//---------------------------------------------------------------------------


// dashboard/layout.tsx
'use client';

import Sidebar from '@/components/Sidebar';
import Breadcrumb from '@/components/Breadcrumb';
import useProtectRoute from '@/hooks/useProtectRoute';
import { useEffect, useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  useProtectRoute();

  // Handles auth redirection
  useEffect(() => {
    // const token = localStorage.getItem('token');
      const token = sessionStorage.getItem('token');

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
    // This container needs to take up the remaining height after the Navbar,
    // and then manage its own internal layout.
    <div className="flex h-full"> {/* Use h-full to make it fill the height of its parent (app/layout's main) */}
      {/* Sidebar on the left */}
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 bg-gray-50 relative overflow-y-auto">
        {/* Breadcrumb added here */}
        <Breadcrumb />

        {/* Page-specific content */}
        {children}
      </main>
    </div>
  );
}