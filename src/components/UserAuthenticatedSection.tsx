// components/UserAuthenticatedSection.tsx
'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { FaChevronDown, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import Button from '@/components/Button'

interface UserAuthenticatedSectionProps {
    onProfileClick: () => void;
    onLogout: () => void;
    userImageSrc?: string; // Optional prop for the user's avatar image
}

export default function UserAuthenticatedSection({ onProfileClick, onLogout, userImageSrc = "/people/person1.jpg" }: UserAuthenticatedSectionProps) {
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
        <div className="relative inline-flex items-center gap-1 min-w-0" ref={dropdownRef}>
            {/* User Image (Circular) - Remains here as part of the section that gets the border */}
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center overflow-hidden">
                <Image
                    src={userImageSrc}
                    alt="User Avatar"
                    width={40}
                    height={40}
                    className="object-cover"
                />
            </div>

            {/* Dropdown Toggle Button - Adjusted for white background again */}
            <button
                className="text-gray-700 hover:text-gray-900 transition flex-shrink-0 focus:outline-none"
                onClick={() => setShowDropdown(!showDropdown)}
                aria-expanded={showDropdown}
                aria-haspopup="true"
            >
                <FaChevronDown />
            </button>

            {/* Dropdown Menu - remains white */}
            {showDropdown && (
                <div
                    className="absolute right-0 top-[calc(100%+25px)] w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5"
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