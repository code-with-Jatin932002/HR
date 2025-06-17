
'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import AuthModal from './AuthModal'; // Your AuthModal (SignIn Form)
import RegisterModal from './RegisterModal'; // Your RegisterModal
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout, loading } = useAuth();

  // This variable is not currently used but kept as per original code
  const isDashboard = pathname.startsWith('/dashboard');

  // Function to handle successful registration and open the login modal
  const handleRegisterSuccessAndRedirectToSignIn = () => {
    setShowRegister(false); // Close the registration modal
    setShowLogin(true);     // Open the login modal
  };

  if (loading) {
    // You might want a loading spinner or skeleton here for better UX
    return (
      <nav className="bg-blue-500 px-4 py-3 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap md:flex-nowrap justify-between items-center">
          <div className="flex items-center space-x-3 mb-3 md:mb-0">
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
            <h1 className="text-xl font-bold">HR Portal</h1>
          </div>
          <div>Loading...</div> {/* Simple loading indicator during auth context loading */}
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="bg-blue-500 px-4 py-3 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap md:flex-nowrap justify-between items-center">
          {/* Logo and title */}
          <div className="flex items-center space-x-3 mb-3 md:mb-0">
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer">
                <Image src="/logo.png" alt="Logo" width={40} height={40} />
                <h1 className="text-xl font-bold">HR Portal</h1>
              </div>
            </Link>
          </div>

          {/* Right side: social + auth */}
          <div className="flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-6 justify-center w-full md:w-auto">
            {!isAuthenticated ? (
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <button
                  className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100 transition cursor-pointer flex items-center justify-center gap-2 w-full md:w-auto"
                  onClick={() => { setShowLogin(true); setShowRegister(false); }} // Ensure only one modal is open
                >
                  <FaSignInAlt />
                  Sign In
                </button>

                <button
                  className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100 transition cursor-pointer flex items-center justify-center gap-2 w-full md:w-auto"
                  onClick={() => { setShowRegister(true); setShowLogin(false); }} // Ensure only one modal is open
                >
                  <FaUserPlus />
                  Register
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {user.email && user.role_type && ( // Display user email and role only if user object exists and has values
                  <span className="bg-white text-blue-600 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                    {user.email} ({user.role_type})
                  </span>
                )}
                <button
                  className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-red-100 transition cursor-pointer w-full md:w-auto"
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Modals */}
      {showLogin && !isAuthenticated && (
        <AuthModal onClose={() => setShowLogin(false)} />
      )}
      {showRegister && !isAuthenticated && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onRegisterSuccessAndRedirectToSignIn={handleRegisterSuccessAndRedirectToSignIn}
        />
      )}
    </>
  );
}