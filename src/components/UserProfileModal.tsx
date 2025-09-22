// components/UserProfileModal.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaInfoCircle } from 'react-icons/fa';
import { UserData } from '../context/AuthContext';

interface UserProfileModalProps {
    user: UserData | null;
    onClose: () => void;
}

export default function UserProfileModal({ user, onClose }: UserProfileModalProps) {
    const router = useRouter();

    const handleEditProfile = () => {
        onClose(); // Close the modal
        router.push('/dashboard/profile'); // Navigate to the new profile page
    };

    if (!user) {
        return null;
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative space-y-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold mb-4 text-blue-600 flex items-center gap-2">
                    <FaInfoCircle /> Your Profile
                </h3>
                <div className="flex flex-col gap-2 border-b pb-4 border-gray-200">
                    <p className="text-gray-700">
                        <span className="font-semibold">Email:</span> {user?.email}
                    </p>
                    <p className="text-gray-700 capitalize">
                        <span className="font-semibold">Role Type:</span> {user?.role_type?.replace('_', ' ')}
                    </p>
                </div>
                {/* Add an "Edit Profile" button to navigate to the new page */}
                <div className="flex justify-end">
                    <button
                        onClick={handleEditProfile}
                        className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Edit Organization Profile
                    </button>
                </div>
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-black text-2xl"
                    aria-label="Close profile modal"
                >
                    &times;
                </button>
            </div>
        </div>
    );
}