// components/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaSignInAlt, FaUserPlus, FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

import AuthModal from "./AuthModal";
import RegisterModal from "./RegisterModal";
import UserProfileModal from "./UserProfileModal";
import Button from "./Button";
import AuthenticatedHeaderContent from "./AuthenticatedHeaderContent";

export default function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // DESTRUCTURING 'loading' IS CRITICAL HERE
  const { user, isAuthenticated, logout, loading } = useAuth();

  const handleRegisterSuccessAndRedirectToSignIn = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const closeAll = () => {
    setShowMobileMenu(false);
    setShowLogin(false);
    setShowRegister(false);
  };

  const navLinks = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#free", label: "Free Service" },
    { href: "#contact", label: "Contact" },
  ];

  const handleLinkClick = () => {
    setShowMobileMenu(false);
  };

  // 💥 NEW: If the Auth Context is loading, return a minimal navbar or null.
  // This prevents the unauthenticated content from showing briefly.
  if (loading) {
    // You can return a simple placeholder or a transparent bar while checking auth
    return (
      <nav className="bg-white px-4 py-3 shadow-xl sticky top-0 z-50">
         <div className="max-w-7xl mx-auto h-10 flex items-center">
            <div className="animate-pulse bg-gray-200 w-32 h-6 rounded"></div>
         </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="bg-white px-4 py-3 shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo and Title - ONLY VISIBLE when NOT AUTHENTICATED */}
          {/* This is the logo you want to HIDE when authenticated */}
          {!isAuthenticated && (
             <Link href="/" className="flex items-center space-x-3 cursor-pointer" onClick={closeAll}>
              <Image src="/new logo.png" alt="HR Portal Logo" width={40} height={40} />
              <h1 className="text-xl font-bold text-gray-500">
                HR Portal
              </h1>
            </Link>
          )}

          {/* Authenticated Content (includes its own logo) */}
          {isAuthenticated ? (
            <AuthenticatedHeaderContent
              user={user as any}
              onProfileClick={() => {
                setShowMobileMenu(false);
                setShowProfileModal(true);
              }}
              onLogout={logout}
            />
          ) : (
            <>
              {/* Desktop Navigation Links */}
              <ul
                className="hidden lg:flex items-center gap-8 
                  text-gray-700 font-semibold"
              >
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="relative cursor-pointer transition-all duration-300 hover:text-fuchsia-600 text-base"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>

              {/* Sign In / Register Buttons - Logged Out */}
              <div className="hidden lg:flex items-center gap-4">
                <button
                  onClick={() => {
                    closeAll();
                    setShowLogin(true);
                  }}
                  className="flex items-center gap-2 px-5 py-1 rounded-full font-medium text-white bg-purple-600 hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform cursor-pointer"
                >
                  <FaSignInAlt className="text-lg" />
                  Sign In
                </button>

                <button
                  onClick={() => {
                    closeAll();
                    setShowRegister(true);
                  }}
                  className="flex items-center gap-2 px-5 py-1 rounded-full font-medium text-purple-600 border-2 border-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg transform cursor-pointer"
                >
                  <FaUserPlus className="text-lg" />
                  Register
                </button>
              </div>

              {/* Mobile Menu Button - Logged Out */}
              <button
                className="lg:hidden text-gray-700 text-2xl p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                aria-label="Toggle Menu"
              >
                {showMobileMenu ? <FaTimes /> : <FaBars />}
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Dropdown - Logged Out */}
        {showMobileMenu && !isAuthenticated && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-100 py-4">
            <ul className="flex flex-col items-start px-4 space-y-2"> 
              {navLinks.map((link) => (
                <li key={link.href} className="w-full">
                  <a
                    href={link.href}
                    onClick={handleLinkClick}
                    className="block p-2 text-sm text-gray-700 font-medium hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors w-full"
                  > 
                    {link.label}
                  </a>
                </li>
              ))}
              {/* Sign In/Register Buttons for Mobile */}
              <li className="w-full pt-4 border-t mt-4 flex flex-col gap-3">
                  <button
                    onClick={() => {
                        closeAll();
                        setShowLogin(true);
                    }}
                    className="flex items-center justify-center w-full gap-2 px-5 py-1 rounded-full font-medium text-white bg-purple-600 hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform cursor-pointer "
                >
                    <FaSignInAlt className="text-lg" />
                    Sign In
                </button>
                  <button
                    onClick={() => {
                        closeAll();
                        setShowRegister(true);
                    }}
                    className="flex items-center justify-center w-full gap-2 px-5 py-1 rounded-full font-medium text-purple-600 border-2 border-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg transform cursor-pointer"
                >
                    <FaUserPlus className="text-lg" />
                    Register
                </button>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* Modals */}
      {showLogin && !isAuthenticated && (
        <AuthModal onClose={() => setShowLogin(false)} />
      )}
      {showRegister && !isAuthenticated && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onRegisterSuccessAndRedirectToSignIn={
            handleRegisterSuccessAndRedirectToSignIn
          }
        />
      )}

      {showProfileModal && (
        <UserProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </>
  );
}