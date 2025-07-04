
// components/Navbar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

import AuthModal from './AuthModal';
import RegisterModal from './RegisterModal';
import UserAuthenticatedSection from './UserAuthenticatedSection'; // The new component
import UserProfileModal from './UserProfileModal'; // The dedicated Profile modal
import Button from './Button'

export default function Navbar() {
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const { user, isAuthenticated, logout, loading } = useAuth();

    const handleRegisterSuccessAndRedirectToSignIn = () => {
        setShowRegister(false);
        setShowLogin(true);
    };

    if (loading) {
        return (
            <nav className="bg-blue-500 px-4 py-3 text-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex flex-wrap md:flex-nowrap justify-between items-center">
                    <div className="flex items-center space-x-3 mb-3 md:mb-0">
                        <Image src="/logo.png" alt="Logo" width={40} height={40} />
                        <h1 className="text-xl font-bold">HR Portal</h1>
                    </div>
                    <div>Loading application state...</div>
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
                        {/* <Link href="/"> */}
                            <div className="flex items-center space-x-3 cursor-pointer">
                                <Image src="/logo.png" alt="Logo" width={40} height={40} />
                                <h1 className="text-xl font-bold">HR Portal</h1>
                            </div>
                        {/* </Link> */}
                    </div>

                    <div className="flex items-center gap-3 md:gap-6 justify-end w-full md:w-auto">
                        {!isAuthenticated ? (
                           
                            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto justify-end">
                                {/* <button
                                    className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100 transition cursor-pointer flex items-center justify-center gap-2 w-full md:w-auto"
                                    onClick={() => { setShowLogin(true); setShowRegister(false); }}
                                >
                                    <FaSignInAlt />
                                    Sign In
                                </button>
                                <button
                                    className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-100 transition cursor-pointer flex items-center justify-center gap-2 w-full md:w-auto"
                                    onClick={() => { setShowRegister(true); setShowLogin(false); }}
                                >
                                    <FaUserPlus />
                                    Register
                                </button> */}
                                <Button
                               label="Sign In"
                               icon={<FaSignInAlt />}
                               variant="white"
                               onClick={() => {
                                setShowLogin(true);
                                setShowRegister(false);
                             }}
                               fullWidth
                            />

                        <Button
                         label="Register"
                        icon={<FaUserPlus />}
                        variant="white"
                        onClick={() => {
                        setShowRegister(true);
                        setShowLogin(false);
                         }}
                         fullWidth
                        />   

                            </div>
                        ) : (
                            <UserAuthenticatedSection
                                user={user}
                                onProfileClick={() => setShowProfileModal(true)}
                                onLogout={logout}
                            />
                        )}
                    </div>
                </div>
            </nav>

            {showLogin && !isAuthenticated && (
                <AuthModal onClose={() => setShowLogin(false)} />
            )}
            {showRegister && !isAuthenticated && (
                <RegisterModal
                    onClose={() => setShowRegister(false)}
                    onRegisterSuccessAndRedirectToSignIn={handleRegisterSuccessAndRedirectToSignIn}
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


