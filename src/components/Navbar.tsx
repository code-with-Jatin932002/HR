// components/Navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";
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

  const { user, isAuthenticated, logout, loading } = useAuth();

  const handleRegisterSuccessAndRedirectToSignIn = () => {
    setShowRegister(false);
    setShowLogin(true);
  };
  return (
    <>
      <nav className="bg-white px-4 py-3 shadow-md sticky top-0 z-50">
        {isAuthenticated ? (
          <AuthenticatedHeaderContent
            user={user}
            onProfileClick={() => setShowProfileModal(true)}
            onLogout={logout}
          />
        ) : (
          <div className="max-w-7xl mx-auto flex flex-wrap md:flex-nowrap justify-between items-center">
            <div className="flex items-center space-x-8mb-3 md:mb-0 left-10">
              <div className="flex items-center space-x-5 cursor-pointer">
                <Image src="/new logo.png" alt="Logo" width={40} height={40} />
                <h1 className="text -xl font-bold text-gray-500">HR Portal</h1>
              </div>
            </div>
            <nav className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50">
              <ul
                className="flex items-center gap-10 
                         bg-gradient-to-r from-white-700 via-white-700 to-white-700 
                        text-gray-700 font-semibold px-10 py-3 rounded-full shadow-2xl"
              >
                <li>
                  <a
                    href="#home"
                    className="relative cursor-pointer transition-all duration-300 hover:text-fuchsia-400"
                  >
                    Home
                  </a>{" "}
                </li>
                <li>
                  <a
                    href="#about"
                    className="relative cursor-pointer transition-all duration-300 hover:text-fuchsia-400"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#services"
                    className="relative cursor-pointer transition-all duration-300 hover:text-fuchsia-400"
                  >
                    Services
                  </a>
                </li>
                <li>
                  <a
                    href="#free"
                    className="relative cursor-pointer transition-all duration-300 hover:text-fuchsia-400"
                  >
                    Free Service
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="relative cursor-pointer transition-all duration-300 hover:text-fuchsia-400"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </nav>

            <div className="w-32"></div>

            <div className="fixed top-4  right-10 flex items-center gap-4 z-50">
              <button
                onClick={() => {
                  setShowLogin(true);
                  setShowRegister(false);
                }}
                className="flex items-center gap-2 px-5 py-1 rounded-full font-medium text-white bg-purple-600 hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform "
              >
                <FaSignInAlt className="text-lg" />
                Sign In
              </button>

              <button
                onClick={() => {
                  setShowRegister(true);
                  setShowLogin(false);
                }}
                className="flex items-center gap-2 px-5 py-1 rounded-full font-medium text-purple-600 border-2 border-purple-600 hover:bg-purple-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg transform"
              >
                <FaUserPlus className="text-lg" />
                Register
              </button>
            </div>
          </div>
        )}
      </nav>

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
