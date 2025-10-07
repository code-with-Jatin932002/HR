'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Image from 'next/image';
import { FaBell, FaTimes, FaSpinner } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import callApi from '@/utils/callApi';
import { UserData as ImportedUserData } from '../context/AuthContext';
import UserAuthenticatedSection from './UserAuthenticatedSection';

interface UserWithIdAndRole extends ImportedUserData {
    id: string;
    role_type: string;
    first_name?: string;
    last_name?: string;
}

interface NotificationMessage {
    id: string;
    message: string;
    created_at: string;
    entityType: 'feedback' | 'announcement'; 
}

interface AuthenticatedHeaderContentProps {
    user: UserWithIdAndRole | null;
    onProfileClick: () => void;
    onLogout: () => void;
}

export default function AuthenticatedHeaderContent({ user, onProfileClick, onLogout }: AuthenticatedHeaderContentProps) {
    const router = useRouter();
    const [totalUnreadCount, setTotalUnreadCount] = useState(0); 
    const [messages, setMessages] = useState<NotificationMessage[]>([]); 
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false); 
    const dropdownRef = useRef<HTMLDivElement>(null);

    const roleType = useMemo(() => user?.role_type?.toLowerCase() || '', [user]);
    const isAdmin = useMemo(() => roleType === 'admin' || roleType === 'super_admin', [roleType]);
    const isAnnouncementRecipient = useMemo(() => 
        roleType === 'hr' || roleType === 'manager' || roleType === 'employee', 
        [roleType]
    );
    const shouldShowBell = useMemo(() => isAdmin || isAnnouncementRecipient, [isAdmin, isAnnouncementRecipient]);

    // --- Utility Functions ---

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getDisplayName = () => {
        if (user?.first_name && user?.last_name) {
            return `${user.first_name} ${user.last_name}`;
        }
        return user?.email || 'User';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; 
        
        return new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            day: 'numeric',
            month: 'short',
        }).format(date);
    };

    // -----------------------------------------------------------
    // 2. API CALLS: COUNT (Using generic APIs for reliability)
    // -----------------------------------------------------------
    
    const fetchAllUnreadCounts = useCallback(async () => {
        if (!user || !shouldShowBell) {
             setTotalUnreadCount(0);
             return;
        }

        let totalCount = 0;
        const token = sessionStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // 1. ADMIN ONLY: Fetch Feedback Count (Generic API)
        if (isAdmin) {
            try {
                // Endpoint: /notifications/count?entity_type=feedback
                const feedbackResponse = await callApi('get', '/notifications/count?entity_type=feedback', null, headers);
                totalCount += feedbackResponse.unreadCount || 0; 
            } catch (error) {
                console.warn('Failed to fetch ADMIN feedback count:', error);
            }
        }

        // 2. HR/Manager/Employee: Fetch Announcement Count (Generic API)
        if (isAnnouncementRecipient) {
            try {
                // Endpoint: /notifications/count?entity_type=announcement
                const announcementResponse = await callApi('get', '/notifications/count?entity_type=announcement', null, headers);
                totalCount += announcementResponse.unreadCount || 0;
            } catch (error) {
                console.warn('Failed to fetch Announcement count:', error);
            }
        }

        setTotalUnreadCount(totalCount);
    }, [isAdmin, isAnnouncementRecipient, user, shouldShowBell]);


    // -----------------------------------------------------------
    // 3. API CALLS: MESSAGES & MARK AS READ
    // -----------------------------------------------------------

    const fetchUnreadMessages = useCallback(async () => {
        if (!user || totalUnreadCount === 0) return;
        
        setIsLoadingMessages(true);
        let allMessages: NotificationMessage[] = [];
        const token = sessionStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        try {
            // 1. ADMIN ONLY: Fetch Feedback Messages (Generic API)
            if (isAdmin) {
                // Endpoint: /notifications/messages?entity_type=feedback
                const feedbackResponse = await callApi('get', '/notifications/messages?entity_type=feedback', null, headers);
                const feedbackMsgs = (feedbackResponse.messages || []).map((msg: any) => ({ ...msg, entityType: 'feedback' as const }));
                allMessages.push(...feedbackMsgs);
            }

            // 2. HR/Manager/Employee: Fetch Announcement Messages (Generic API)
            if (isAnnouncementRecipient) {
                // Endpoint: /notifications/messages?entity_type=announcement
                const announcementResponse = await callApi('get', '/notifications/messages?entity_type=announcement', null, headers);
                const announcementMsgs = (announcementResponse.messages || []).map((msg: any) => ({ ...msg, entityType: 'announcement' as const }));
                allMessages.push(...announcementMsgs);
            }
            
            allMessages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            
            setMessages(allMessages);

        } catch (error) {
            console.error('Failed to fetch unread messages:', error);
            setMessages([]);
            toast.error('Failed to fetch notification messages.');
        } finally {
            setIsLoadingMessages(false);
        }
    }, [isAdmin, isAnnouncementRecipient, user, totalUnreadCount]);


    // --- API Call: Mark ONE entity type as Read (Using generic PUT APIs) ---
    const markAsReadByType = useCallback(async (entityType: 'feedback' | 'announcement') => {
        let success = true;
        const token = sessionStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        let path = '';

        if (entityType === 'feedback' && isAdmin) {
            // Admin uses the GENERIC mark-read API path for consistency with the generic count API.
            path = '/notifications/mark-read/feedback'; 
        } else if (entityType === 'announcement' && isAnnouncementRecipient) {
            path = '/notifications/mark-read/announcement';
        } else {
            return true;
        }

        try {
            await callApi('put', path, null, headers);
            toast.success(`${entityType.charAt(0).toUpperCase() + entityType.slice(1)} notifications marked as read.`);
        } catch (error) {
            console.error(`Failed to mark ${entityType} notifications as read:`, error);
            toast.error(`Failed to clear ${entityType} notifications.`);
            success = false;
        }
        return success;
    }, [isAdmin, isAnnouncementRecipient]);


    // --- Message/Dropdown Click Handler ---
    const handleViewAndMarkRead = async () => {
        const mostRecentType = messages.length > 0 ? messages[0].entityType : null;
        if (!mostRecentType) {
            setIsDropdownOpen(false);
            return;
        }

        const success = await markAsReadByType(mostRecentType);
        
        if (success) {
            // Clear UI immediately
            setMessages([]); 
            setTotalUnreadCount(0);
            
            // Re-fetch count to ensure persistence
            await fetchAllUnreadCounts(); 

            // Navigate
            const navigatePath = mostRecentType === 'feedback' ? '/dashboard/feedback' : '/dashboard/announcement';
            router.push(navigatePath);
            
            setIsDropdownOpen(false);
        } else {
            setIsDropdownOpen(false); 
        }
    };


    // -----------------------------------------------------------
    // 4. EFFECTS & HANDLERS
    // -----------------------------------------------------------
    
    useEffect(() => {
        fetchAllUnreadCounts();
    }, [fetchAllUnreadCounts]);
    

    const handleBellClick = () => {
        if (!shouldShowBell) return;

        if (isDropdownOpen) {
            setIsDropdownOpen(false);
        } else {
            if (totalUnreadCount > 0) {
                fetchUnreadMessages();
            }
            setIsDropdownOpen(true);
        }
    };

    return (
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-x-2 px-2 py-1 w-full">

            {/* Logo and Title Section - RESTORING ORIGINAL STRUCTURE AND STYLES */}
            <div className="flex items-center space-x-2 md:space-x-3 flex-shrink">
                <div className="flex items-center space-x-2 md:space-x-3 cursor-pointer">
                    <Image src="/new logo.png" alt="Logo" width={40} height={40} />
                    <h1 className="text-sm md:text-xl font-bold text-gray-800 whitespace-nowrap">HR Portal</h1>
                </div>
            </div>

            <div className="flex items-center gap-1">
                {/* Notification Bell Icon with Dropdown Container */}
                {shouldShowBell && (
                    <div className="relative" ref={dropdownRef}>
                        <button 
                            onClick={handleBellClick}
                            className="relative cursor-pointer flex items-center justify-center w-10 h-10 rounded-md bg-gray-100 text-gray-600 hover:bg-purple-200 transition focus:outline-none focus:ring-2 focus:ring-purple-500 mr-2"
                        >
                            <FaBell className="text-xl" />
                            {totalUnreadCount > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white leading-none">
                                    {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown Content (Unchanged) */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                                <div className="p-4 border-b flex justify-between items-center">
                                    <h4 className="text-lg font-bold text-gray-700">Notifications ({totalUnreadCount})</h4>
                                    <button onClick={() => setIsDropdownOpen(false)} className="text-gray-400 hover:text-gray-600">
                                        <FaTimes />
                                    </button>
                                </div>
                                
                                {isLoadingMessages && (
                                    <div className="p-4 flex items-center justify-center text-gray-500">
                                        <FaSpinner className="animate-spin mr-2" /> Loading messages...
                                    </div>
                                )}

                                {!isLoadingMessages && totalUnreadCount === 0 && (
                                    <div className="p-4 text-sm text-gray-500">No new notifications.</div>
                                )}
                                
                                {!isLoadingMessages && messages.length > 0 && (
                                    <>
                                        <div className="max-h-60 overflow-y-auto">
                                            {messages.map((notification) => (
                                                <div 
                                                    key={notification.id} 
                                                    className="px-4 py-3 border-b hover:bg-gray-50 cursor-pointer"
                                                    onClick={handleViewAndMarkRead}
                                                >
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-purple-600 mt-1">
                                                        {formatDate(notification.created_at)}
                                                        <span className="ml-2 font-bold text-gray-400 capitalize">
                                                            ({notification.entityType})
                                                        </span>
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-2 border-t">
                                            <button 
                                                onClick={handleViewAndMarkRead}
                                                className="w-full text-center text-sm font-semibold text-purple-600 hover:text-purple-800 py-1"
                                            >
                                                View All & Mark as Read
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* User Info Section - RESTORING ORIGINAL STRUCTURE AND STYLES */}
                <div className="flex cursor-pointer items-center gap-1 border border-purple-300 rounded-md pl-2 pr-1 py-1 min-w-0">
                    <div className="flex flex-col items-end min-w-0">
                        <span className="text-gray-900 text-xs xs:text-sm md:text-base font-semibold text-right break-words leading-tight">
                            {getDisplayName()}
                        </span>
                        <span className="text-gray-600 text-[10px] xs:text-xs md:text-sm text-right break-words leading-tight capitalize">
                            {user?.role_type?.replace('_', ' ')}
                        </span>
                    </div>

                    <UserAuthenticatedSection
                        onLogout={onLogout}
                        userImageSrc="/people/person1.jpg"
                    />
                </div>
            </div>
        </div>
    );
}

