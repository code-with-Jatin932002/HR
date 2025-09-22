'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { FaChevronDown, FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import Link from 'next/link';

interface UserAuthenticatedSectionProps {
  onProfileClick: () => void;
  onLogout: () => void;
  userImageSrc?: string;
}

export default function UserAuthenticatedSection({ 
    onProfileClick, 
    onLogout, 
    userImageSrc = "/people/person1.jpg"
}: UserAuthenticatedSectionProps) {
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
    <div className="relative inline-flex items-center gap-4" ref={dropdownRef}>
      <button 
        onClick={() => setShowDropdown(!showDropdown)} 
        className="flex items-center gap-2"
        aria-expanded={showDropdown}
        aria-haspopup="true"
      >
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={userImageSrc}
            alt="User Avatar"
            width={48}
            height={48}
            className="object-cover w-full h-full"
          />
        </div>
        <FaChevronDown className="text-gray-700 dark:text-gray-300 transition-transform duration-300 ease-in-out" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-[calc(100%+25px)] w-56 flex-col rounded-md border border-gray-200 bg-white shadow-lg py-2 z-50">
          <ul className="flex flex-col border-b border-gray-200 px-4 py-3 space-y-2">
            <li>
              <button 
                onClick={() => {
                  setShowDropdown(false);
                  onProfileClick();
                }}
                className="flex items-center gap-3.5 w-full text-left text-sm font-medium text-gray-700 hover:text-blue-500 transition-colors duration-200 ease-in-out focus:outline-none"
              >
                <FaUserCircle className="text-lg" />
                My Profile
              </button>
            </li>
          </ul>
          <div className="px-4 py-2">
            <button
              onClick={() => {
                setShowDropdown(false);
                onLogout();
              }}
              className="flex items-center gap-3.5 w-full text-left text-sm font-medium text-gray-700 hover:text-blue-500 transition-colors duration-200 ease-in-out focus:outline-none"
            >
              <FaSignOutAlt className="text-lg" />
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}