
// components/UserAuthenticatedSection.tsx
'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { FaChevronDown, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import { UserData } from '../context/AuthContext'; // Adjust path
import Button from '@/components/Button'

interface UserAuthenticatedSectionProps {
    user: UserData | null;
    onProfileClick: () => void;
    onLogout: () => void;
}

export default function UserAuthenticatedSection({ user, onProfileClick, onLogout }: UserAuthenticatedSectionProps) {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative inline-flex items-center gap-3 min-w-0" ref={dropdownRef}>

            <div className="flex flex-col items-end mr-2 min-w-0">
                <span className="text-white text-base font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] md:max-w-none">
                    {user?.email}
                </span>
                <span className="text-blue-200 text-sm capitalize whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] md:max-w-none">
                    {user?.role_type?.replace('_', ' ')}
                </span>
            </div>
            {/* User Image (Circular) - flex-shrink-0 to prevent shrinking and maintain size */}
            <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center overflow-hidden">
                <Image
                    src="/people/person1.jpg" 
                    alt="User Avatar"
                    width={40}
                    height={40}
                    className="object-cover"
                />
            </div>
         
            <button
                className="text-white hover:text-blue-200 transition flex-shrink-0"
                onClick={() => setShowDropdown(!showDropdown)}
                aria-expanded={showDropdown}
                aria-haspopup="true"
            >
                <FaChevronDown />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
                // <div
                //     className="absolute right-0 top-[calc(100%+15px)] w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5 focus:outline-none"
                //     style={{ minWidth: 'max-content' }} // Ensures dropdown width adapts to content if needed
                // >
                //     <button
                //         className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center gap-2 border-b border-gray-200" // Added border-b
                //         onClick={() => { setShowDropdown(false); onProfileClick(); }}
                //     >
                //         <FaUserCircle /> My Profile
                //     </button>
                //     <button
                //         className="w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center gap-2"
                //         onClick={() => { setShowDropdown(false); onLogout(); }}
                //     >
                //         <FaSignOutAlt /> Logout
                //     </button>
                // </div>
                <div
  className="absolute right-0 top-[calc(100%+15px)] w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5 focus:outline-none"
  style={{ minWidth: 'max-content' }}
>
  <Button
    variant="dropdown"
    label="My Profile"
    icon={<FaUserCircle />}
    onClick={() => {
      setShowDropdown(false);
      onProfileClick();
    }}
  />

  <Button
    variant="dropdown"
    label="Logout"
    icon={<FaSignOutAlt />}
    onClick={() => {
      setShowDropdown(false);
      onLogout();
    }}
  />
</div>

            )}
        </div>
    );
}


