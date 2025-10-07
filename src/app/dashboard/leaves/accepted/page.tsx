'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import useProtectRoute from '@/hooks/useProtectRoute';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import callApi from '@/utils/callApi';
import ActionButtons from '@/components/ActionButtons';
import Table from '@/components/Table';
import Loader from '@/components/Loader';
import Button from "@/components/Button";
import Pagination from '@/components/Pagination';
import { FiX } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

const MySwal = withReactContent(Swal); // Initialize SweetAlert2 for React

// Define interfaces for type safety
interface Leave {
    id?: string;
    user_id: string;
    reviewer_id?: string;
    manager_id?: string;
    leave_type: string;
    description: string;
    start_date: string;
    end_date: string;
    hr_status?: string;
    manager_status?: string;
    status?: string; // Overall status
    hr_rejection_reason?: string | null;
    manager_rejection_reason?: string | null;
    created_at?: string;
}

interface User {
    id: string;
    first_name: string;
    last_name: string;
    full_name?: string;
}

interface LeaveApiResponse {
    leaves: Leave[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

interface UserApiResponse {
    users: User[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

// Custom hook to get user role from sessionStorage
const useUserRole = () => {
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const userRole = sessionStorage.getItem('role_type');
        if (userRole) {
            setRole(userRole.toLowerCase());
        } else {
            setRole(null);
        }
    }, []);

    return role;
};

// Utility function to get status color
function getStatusColor(status: string) {
    switch (status) {
        case 'ACCEPTED':
            return 'bg-green-100 text-green-700';
        case 'REJECTED':
            return 'bg-red-100 text-red-700';
        case 'PENDING':
            return 'bg-yellow-100 text-yellow-700';
        case 'N/A':
            return 'bg-gray-100 text-gray-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
}

export default function AcceptedLeavesPage() {
    useProtectRoute();
    const userRole = useUserRole();
    const [showViewForm, setShowViewForm] = useState(false);
    const [viewedLeave, setViewedLeave] = useState<Leave | null>(null);
    const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;

    // Fetch accepted leaves data
    const {
        data: leavesData,
        isLoading: isLoadingLeaves,
        isError: isErrorLeaves,
        refetch: refetchLeaves
    } = useQuery<LeaveApiResponse, Error, LeaveApiResponse, ['acceptedLeaves', number, number]>({
        queryKey: ['acceptedLeaves', currentPage, itemsPerPage],
        queryFn: async ({ queryKey }) => {
            const [_key, page, limit] = queryKey;
            if (!token) throw new Error('Authentication token not found.');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL;
            // Fetch leaves with status=ACCEPTED
            return await callApi('get', `${baseUrl}/leaves?page=${page}&limit=${limit}&status=ACCEPTED`, null, {
                Authorization: `Bearer ${token}`,
            });
        },
        placeholderData: (previousData) => previousData,
        enabled: !!token,
    });
    const leaves = leavesData?.leaves || [];
    const totalItems = leavesData?.totalItems || 0;
    const totalPages = leavesData?.totalPages || 1;

    // Fetch all users for name lookup
    const {
        data: usersData,
        isLoading: isLoadingUsers,
        isError: isErrorUsers
    } = useQuery<UserApiResponse, Error, UserApiResponse, ['users']>({
        queryKey: ['users'],
        queryFn: async () => {
            if (!token) throw new Error('Authentication token not found.');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL;
            return await callApi('get', `${baseUrl}/users?page=1&limit=100`, null, {
                Authorization: `Bearer ${token}`,
            });
        },
        enabled: !!token,
        refetchOnWindowFocus: false,
        staleTime: 15 * 60 * 1000, // Cache for 15 minutes
    });

    const usersMap = React.useMemo(() => {
        const map = new Map<string, string>();
        if (usersData?.users) {
            usersData.users.forEach(user => {
                map.set(user.id, `${user.first_name} ${user.last_name}`.trim());
            });
        }
        return map;
    }, [usersData]);

    const updateStatusMutation = useMutation({
        mutationFn: async ({ leaveId, status, reason }: { leaveId: string, status: string, reason?: string }) => {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL;
            return await callApi('patch', `${baseUrl}/leaves/${leaveId}/status`, { status, reason }, {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            });
        },
        onMutate: () => {
            setIsSubmittingStatus(true);
            toast.loading('Updating leave status...', { id: 'statusUpdate' });
        },
        onSuccess: async (data, variables) => {
            await refetchLeaves();
            toast.success(`Leave ${variables.status.toLowerCase()} successfully`, { id: 'statusUpdate' });
            setShowViewForm(false);
            setViewedLeave(null);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.detail || 'Failed to update leave status', { id: 'statusUpdate' });
        },
        onSettled: () => {
            setIsSubmittingStatus(false);
        },
    });

    const handleView = (leave: Leave) => {
        setViewedLeave(leave);
        setShowViewForm(true);
    };

    const handleStatusButtonClick = async (status: 'ACCEPTED' | 'REJECTED') => {
        if (viewedLeave?.id) {
            let reason = '';
            if (status === 'REJECTED') {
                const { value: responseReason } = await MySwal.fire({
                    title: 'Reason for rejection',
                    input: 'textarea',
                    inputPlaceholder: 'Type your reason here...',
                    inputAttributes: {
                        'aria-label': 'Type your reason here...',
                    },
                    showCancelButton: true,
                    confirmButtonText: 'Submit',
                    cancelButtonText: 'Cancel',
                    showLoaderOnConfirm: true,
                    preConfirm: (value: string) => {
                        if (!value.trim()) {
                            Swal.showValidationMessage('You need to write a reason!');
                            return false;
                        }
                        return value;
                    },
                });

                if (responseReason === undefined || responseReason === false) {
                    toast('Status update cancelled.', { icon: '👋' });
                    return;
                }
                reason = responseReason;
            }

            updateStatusMutation.mutate({
                leaveId: viewedLeave.id,
                status: status,
                reason: reason,
            });
        }
    };

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    if (isLoadingLeaves || isLoadingUsers) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (isErrorLeaves || isErrorUsers) {
        return (
            <div className="flex h-full flex-col items-center justify-center text-red-500">
                <p>Failed to load accepted leave records. Please try again.</p>
                <Button onClick={() => refetchLeaves()} label="Retry" variant="primary" className="mt-4" />
            </div>
        );
    }

    const canUpdateStatus = userRole === 'hr' || userRole === 'manager';

    const columns = [
        {
            label: 'Employee Name',
            key: 'user_id',
            render: (leave: Leave) => {
                const userName = usersMap.get(leave.user_id) || 'N/A';
                return <span>{userName}</span>;
            },
        },
        { label: 'Leave Type', key: 'leave_type' },
        { label: 'Description', key: 'description' },
        { label: 'From', key: 'start_date' },
        { label: 'To', key: 'end_date' },
        {
            label: 'Overall Status',
            key: 'status',
            render: (leave: Leave) => {
                const status = leave.status || 'N/A';
                return (
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}
                    >
                        {status}
                    </span>
                );
            },
        },
        {
            label: 'HR Status',
            key: 'hr_status',
            render: (leave: Leave) => {
                const status = leave.hr_status || 'N/A';
                return (
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}
                    >
                        {status}
                    </span>
                );
            },
        },
        {
            label: 'Manager Status',
            key: 'manager_status',
            render: (leave: Leave) => {
                const status = leave.manager_status || 'N/A';
                return (
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}
                    >
                        {status}
                    </span>
                );
            },
        },
    ];

    
    // ----------------------------------------------------------------------
    // View Leave Modal - MAX WIDTH ADJUSTED HERE
    // ----------------------------------------------------------------------
    if(showViewForm && viewedLeave){
        return (
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mt-10 max-w-full xl:max-w-7xl rounded bg-white p-6 shadow relative">
                    {/* ^ CHANGED FROM max-w-6xl */}
                    {isSubmittingStatus && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-white bg-opacity-80">
                            <Loader />
                        </div>
                    )}
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-semibold text-gray-700">Leave Details</h3>
                        <button
                            className="text-gray-400 hover:text-gray-700 transition"
                            onClick={() => {
                                setShowViewForm(false);
                                setViewedLeave(null);
                            }}
                        >
                            <FiX size={24} />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Employee Name */}
                        <div className='bg-gray-50 p-4 rounded-lg'>
                            <p className="mb-1 font-semibold text-gray-600">Employee Name:</p>
                            <p className="text-gray-900">{usersMap.get(viewedLeave.user_id) || 'Loading...'}</p>
                        </div>
                        {/* Leave Type */}
                        <div className='bg-gray-50 p-4 rounded-lg'>
                            <p className="mb-1 font-semibold text-gray-600">Leave Type:</p>
                            <p className="text-gray-900">{viewedLeave.leave_type}</p>
                        </div>
                        {/* From/To Dates */}
                        <div className='col-span-1 md:col-span-2 grid grid-cols-2 gap-6'>
                            <div className='bg-gray-50 p-4 rounded-lg'>
                                <p className="mb-1 font-semibold text-gray-600">Start Date:</p>
                                <p className="text-gray-900">{viewedLeave.start_date.split('T')[0]}</p>
                            </div>
                            <div className='bg-gray-50 p-4 rounded-lg'>
                                <p className="mb-1 font-semibold text-gray-600">End Date:</p>
                                <p className="text-gray-900">{viewedLeave.end_date.split('T')[0]}</p>
                            </div>
                        </div>
                        {/* Description */}
                        <div className='col-span-1 md:col-span-2 bg-gray-50 p-4 rounded-lg'>
                            <p className="mb-1 font-semibold text-gray-600">Description:</p>
                            <p className="text-gray-900 whitespace-pre-wrap">{viewedLeave.description}</p>
                        </div>

                        {/* Overall Status */}
                        <div className='bg-gray-50 p-4 rounded-lg'>
                            <p className="mb-1 font-semibold text-gray-600">Overall Status:</p>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold mt-2 ${getStatusColor(viewedLeave.status || 'N/A')}`}>
                                {viewedLeave.status || 'N/A'}
                            </span>
                        </div>
                        {/* HR Status */}
                        <div className='bg-gray-50 p-4 rounded-lg'>
                            <p className="mb-1 font-semibold text-gray-600">HR Status:</p>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(viewedLeave.hr_status || 'N/A')}`}>
                                {viewedLeave.hr_status || 'N/A'}
                            </span>
                            {viewedLeave.hr_status === 'REJECTED' && viewedLeave.hr_rejection_reason && (
                                <p className="rounded border px-3 py-2 bg-red-100 text-red-800 mt-2">Reason: {viewedLeave.hr_rejection_reason}</p>
                            )}
                            {viewedLeave.reviewer_id && (
                                <p className="mt-2 text-sm text-gray-600">Reviewed by (HR): {usersMap.get(viewedLeave.reviewer_id) || 'Loading...'}</p>
                            )}
                        </div>

                        {/* Manager Status */}
                        <div className='bg-gray-50 p-4 rounded-lg'>
                            <p className="mb-1 font-semibold text-gray-600">Manager Status:</p>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(viewedLeave.manager_status || 'N/A')}`}>
                                {viewedLeave.manager_status || 'N/A'}
                            </span>
                            {viewedLeave.manager_status === 'REJECTED' && viewedLeave.manager_rejection_reason && (
                                <p className="rounded border px-3 py-2 bg-red-100 text-red-800 mt-2">Reason: {viewedLeave.manager_rejection_reason}</p>
                            )}
                            {viewedLeave.manager_id && (
                                <p className="mt-2 text-sm text-gray-600">Reviewed by (Manager): {usersMap.get(viewedLeave.manager_id) || 'Loading...'}</p>
                            )}
                        </div>

                        {/* Status Update Buttons (For HR/Manager) */}
                        {canUpdateStatus && (
                            <div className="col-span-1 md:col-span-2 flex justify-end gap-4 pt-4 border-t border-gray-200 mt-4">
                                <Button
                                    type="button"
                                    label="Accept"
                                    onClick={() => handleStatusButtonClick('ACCEPTED')}
                                    variant="success"
                                    disabled={isSubmittingStatus || viewedLeave.status === 'ACCEPTED'}
                                />
                                <Button
                                    type="button"
                                    label="Reject"
                                    onClick={() => handleStatusButtonClick('REJECTED')}
                                    variant="danger"
                                    disabled={isSubmittingStatus || viewedLeave.status === 'REJECTED'}
                                />
                                <Button
                                    type="button"
                                    label="Close"
                                    onClick={() => {
                                        setShowViewForm(false);
                                        setViewedLeave(null);
                                    }}
                                    variant="secondary"
                                />
                            </div>
                        )}
                        {/* Close Button (For Employees/View-Only) */}
                        {!canUpdateStatus && (
                            <div className="col-span-1 md:col-span-2 flex justify-end gap-4 pt-4 border-t border-gray-200 mt-4">
                                <Button
                                    type="button"
                                    label="Close"
                                    onClick={() => {
                                        setShowViewForm(false);
                                        setViewedLeave(null);
                                    }}
                                    variant="secondary"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    // ----------------------------------------------------------------------


    // ----------------------------------------------------------------------
    // Main Table View - MAX WIDTH ADJUSTED HERE
    // ----------------------------------------------------------------------
    return (
        <div className="min-h-screen p-4 bg-gray-100">
            <Toaster position="top-center" reverseOrder={false} />
            <div className="mx-auto mt-10 max-w-full xl:max-w-7xl rounded bg-white p-6 shadow">
                 {/* ^ CHANGED FROM max-w-6xl */}
                {/* Header / Action Button - NO CREATE BUTTON FOR ACCEPTED LEAVES */}
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-2xl font-semibold text-gray-700">Accepted Leave Records</h3>
                </div>
            
                {/* Leave Table */}
                <div>
                    <Table
                        columns={columns}
                        data={leaves}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        actions={(leave) => (
                            <div className="relative">
                                <ActionButtons
                                    showView={true}
                                    onView={() => handleView(leave)}
                                    // NO UPDATE/DELETE ACTIONS as accepted leaves are final
                                    showUpdate={false}
                                    showDelete={false} 
                                />
                            </div>
                        )}
                    />

                    <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
                            <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                            <span className="font-medium">{totalItems}</span> results
                        </p>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}