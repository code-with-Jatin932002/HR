
'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { FaSignInAlt, FaUserPlus, FaTwitter, FaFacebook, FaGlobe } from 'react-icons/fa';
import AuthModal from './AuthModal';
import RegisterModal from './RegisterModal';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();

  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <>
      <nav className="bg-blue-500 px-4 py-3 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap md:flex-nowrap justify-between items-center">
          {/* Logo and title */}
          <div className="flex items-center space-x-3 mb-3 md:mb-0">
            <Image src="/logo.png" alt="Logo" width={40} height={40} />
            <h1 className="text-xl font-bold">HR Portal</h1>
          </div>

          {/* Right side: social + auth */}
          <div className="flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-6 justify-center w-full md:w-auto">
            {/* <div className="flex items-center gap-3 justify-center w-full md:w-auto">
              <FaGlobe className="text-white text-xl cursor-pointer hover:scale-110 transition" />
              <FaFacebook className="text-white text-xl cursor-pointer hover:scale-110 transition" />
              <FaTwitter className="text-white text-xl cursor-pointer hover:scale-110 transition" />
            </div> */}

            {!isAuthenticated ? (
              <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <button
                  className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100 transition cursor-pointer flex items-center justify-center gap-2 w-full md:w-auto"
                  onClick={() => setShowLogin(true)}
                >
                  <FaSignInAlt />
                  Sign In
                </button>

                <button
                  className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100 transition cursor-pointer flex items-center justify-center gap-2 w-full md:w-auto"
                  onClick={() => setShowRegister(true)}
                >
                  <FaUserPlus />
                  Register
                </button>
              </div>
            ) : (
              <button
                className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-red-100 transition cursor-pointer w-full md:w-auto"
                onClick={logout}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Modals */}
      {showLogin && !isAuthenticated && (
        <AuthModal onClose={() => setShowLogin(false)} />
      )}
      {showRegister && !isAuthenticated && (
        <RegisterModal onClose={() => setShowRegister(false)} />
      )}
    </>
  );
}


