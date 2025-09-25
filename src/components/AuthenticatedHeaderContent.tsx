// components/AuthenticatedHeaderContent.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import { FaSearch, FaBell } from 'react-icons/fa';
import { UserData } from '../context/AuthContext';
import UserAuthenticatedSection from './UserAuthenticatedSection';

interface AuthenticatedHeaderContentProps {
    user: UserData | null;
    onProfileClick: () => void;
    onLogout: () => void;
}

export default function AuthenticatedHeaderContent({ user, onProfileClick, onLogout }: AuthenticatedHeaderContentProps) {

    const getDisplayName = () => {
        const typedUser = user as (UserData & { first_name?: string; last_name?: string }) | null;

        if (typedUser?.first_name && typedUser?.last_name) {
            return `${typedUser.first_name} ${typedUser.last_name}`;
        }
        return typedUser?.email || 'User';
    };

    return (
        // Adjusted gap-x for tighter horizontal spacing overall.
        // Used px-2 for consistent horizontal padding.
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-x-2 px-2 py-1 w-full">

            <div className="flex items-center space-x-2 md:space-x-3 flex-shrink">
                <div className="flex items-center space-x-2 md:space-x-3 cursor-pointer">
                    <Image src="/logo.png" alt="Logo" width={40} height={40} />
                    <h1 className="text-sm md:text-xl font-bold text-gray-800 whitespace-nowrap">HR Portal</h1>
                </div>
            </div>

            {/* <div className="hidden md:flex relative ml-auto mr-3"> 
                <input
                    type="text"
                    placeholder="Search"
                    className="w-full h-10 max-w-[160px] lg:max-w-[200px] xl:max-w-[260px] min-w-[120px] pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-700 placeholder-gray-500"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div> */}

            <div className="flex items-center gap-1">
                <button className="flex items-center justify-center w-10 h-10 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <FaBell className="text-xl" />
                </button>

                <div className="flex items-center gap-1 border border-gray-300 rounded-md pl-2 pr-1 py-1 min-w-0"> {/* Reduced padding */}
             
                    <div className="flex flex-col items-end min-w-0">
                        <span className="text-gray-900 text-xs xs:text-sm md:text-base font-semibold text-right break-words leading-tight">
                            {getDisplayName()}
                        </span>
                        <span className="text-gray-600 text-[10px] xs:text-xs md:text-sm text-right break-words leading-tight capitalize">
                            {user?.role_type?.replace('_', ' ')}
                        </span>
                    </div>

                    <UserAuthenticatedSection
                        // onProfileClick={onProfileClick}
                        onLogout={onLogout}
                        userImageSrc="/people/person1.jpg"
                    />
                </div>
            </div>
        </div>
    );
}