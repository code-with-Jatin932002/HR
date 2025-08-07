// components/Navbar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

import AuthModal from './AuthModal';
import RegisterModal from './RegisterModal';
import UserProfileModal from './UserProfileModal';
import Button from './Button';
import AuthenticatedHeaderContent from './AuthenticatedHeaderContent';

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
            <nav className="bg-white px-4 py-3 text-gray-800 shadow-md sticky top-0 z-50">
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
            <nav className="bg-white px-4 py-3 shadow-md sticky top-0 z-50">
                {isAuthenticated ? (
                    <AuthenticatedHeaderContent
                        user={user}
                        onProfileClick={() => setShowProfileModal(true)}
                        onLogout={logout}
                    />
                ) : (
                    <div className="max-w-7xl mx-auto flex flex-wrap md:flex-nowrap justify-between items-center">
                        <div className="flex items-center space-x-3 mb-3 md:mb-0">
                            <div className="flex items-center space-x-3 cursor-pointer">
                                <Image src="/logo.png" alt="Logo" width={40} height={40} />
                                <h1 className="text-xl font-bold text-gray-800">HR Portal</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 md:gap-6 justify-end w-full md:w-auto">
                            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto justify-end">
                                <Button
                                    label="Sign In"
                                    icon={<FaSignInAlt />}
                                    variant="primary"
                                    onClick={() => {
                                        setShowLogin(true);
                                        setShowRegister(false);
                                    }}
                                    fullWidth
                                />

                                <Button
                                    label="Register"
                                    icon={<FaUserPlus />}
                                    variant="primary"
                                    onClick={() => {
                                        setShowRegister(true);
                                        setShowLogin(false);
                                    }}
                                    fullWidth
                                />
                            </div>
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