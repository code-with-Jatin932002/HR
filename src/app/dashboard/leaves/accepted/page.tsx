// accepted.tsx
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

// Import react-hot-toast
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast'; // Still keeping it here for demonstration

const MySwal = withReactContent(Swal); // Initialize SweetAlert2 for React

// Custom hook to get user role from localStorage
const useUserRole = () => {
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const userRole = sessionStorage.getItem('role_type');
        setRole(userRole);
    }, []);

    return role;
};

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

interface Leave {
    id?: string;
    user_id?: string;
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

export default function AcceptedLeavesPage() {
    useProtectRoute();
    const userRole = useUserRole();
    const [showViewForm, setShowViewForm] = useState(false);
    const [viewedLeave, setViewedLeave] = useState<Leave | null>(null);
    const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;

    const fetchLeaves = async ({ queryKey }: { queryKey: any[] }) => {
        const [_key, currentPage, itemsPerPage] = queryKey;
        if (!token) {
            // Use toast for this authentication error
            toast.error('Authentication token not found. Please log in.');
            throw new Error('Authentication token not found. Please log in.');
        }
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const responseData = await callApi('get', `${baseUrl}/leaves?page=${currentPage}&limit=${itemsPerPage}&status=ACCEPTED`, null, {
            Authorization: `Bearer ${token}`,
        });
        return responseData;
    };

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['acceptedLeaves', currentPage, itemsPerPage],
        queryFn: fetchLeaves,
        placeholderData: (previousData) => previousData,
        enabled: !!token,
    });
    const leaves = data?.leaves || [];
    const totalItems = data?.totalItems || 0;
    const totalPages = data?.totalPages || 1;

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
            toast.loading('Updating leave status...', { id: 'statusUpdate' }); // Show loading toast
        },
        onSuccess: async (data, variables) => {
            await refetch();
            // Use toast for success message
            toast.success(`Leave ${variables.status.toLowerCase()} successfully`, { id: 'statusUpdate' });
            setShowViewForm(false);
            setViewedLeave(null);
        },
        onError: (error: any) => {
            // Use toast for error message
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
                    showLoaderOnConfirm: true, // Show loading on confirm
                    preConfirm: (value: string) => {
                        if (!value.trim()) {
                            // Use Swal's built-in error for input validation
                            Swal.showValidationMessage('You need to write a reason!');
                            return false; // Prevent closing the modal
                        }
                        return value; // Allow closing and pass the value
                    },
                });

                // If user clicks cancel (responseReason is undefined) or dismisses the modal
                if (responseReason === undefined || responseReason === false) {
                    toast('Rejection cancelled.', { icon: '👋' }); // Optional: show a small toast for cancellation
                    return;
                }
                reason = responseReason;
            }

            // Trigger the mutation after reason is obtained (if rejected)
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

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex h-full flex-col items-center justify-center text-red-500">
                <p>Failed to load accepted leave records. Please try again.</p>
                <Button onClick={() => refetch()} label="Retry" variant="primary" className="mt-4" />
            </div>
        );
    }

    // Determine if the current user role can update leave statuses
    const canUpdateStatus = userRole === 'Hr' || userRole === 'Manager';

    const columns = [
        { label: 'Leave Type', key: 'leave_type' },
        { label: 'Description', key: 'description' },
        { label: 'From', key: 'start_date' },
        { label: 'To', key: 'end_date' },
        {
            label: 'Overall Status',
            key: 'status',
            render: (leave: any) => {
                const status = leave.status || 'Pending';
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
            render: (leave: any) => {
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
            render: (leave: any) => {
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

    return (
        <div className="min-h-screen p-6 bg-gray-100">
            {/* Toaster component to display toasts in the center */}
            <Toaster position="top-center" reverseOrder={false} />

            <div className="mb-6 flex items-center justify-between">
                {/* <h2 className="text-3xl font-bold">Accepted Leave Records</h2>  */}
            </div>

            {/* View Leave Modal */}
            {showViewForm && viewedLeave && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg overflow-y-auto max-h-[90vh]">
                        {isSubmittingStatus && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-white bg-opacity-80">
                                <Loader />
                            </div>
                        )}
                        <h3 className="mb-4 text-xl font-semibold">Leave Details</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="mb-1 font-semibold">Leave Type:</p>
                                <p className="rounded border px-3 py-2 bg-gray-50">{viewedLeave.leave_type}</p>
                            </div>
                            <div>
                                <p className="mb-1 font-semibold">Description:</p>
                                <p className="rounded border px-3 py-2 bg-gray-50">{viewedLeave.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="mb-1 font-semibold">From:</p>
                                    <p className="rounded border px-3 py-2 bg-gray-50">{viewedLeave.start_date}</p>
                                </div>
                                <div>
                                    <p className="mb-1 font-semibold">To:</p>
                                    <p className="rounded border px-3 py-2 bg-gray-50">{viewedLeave.end_date}</p>
                                </div>
                            </div>
                            <div>
                                <p className="mb-1 font-semibold">Overall Status:</p>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(viewedLeave.status || 'Pending')}`}
                                >
                                    {viewedLeave.status || 'Pending'}
                                </span>
                            </div>

                            {/* Display HR Status and Reason */}
                            {viewedLeave.hr_status && (
                                <div>
                                    <p className="mb-1 font-semibold">HR Status:</p>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(viewedLeave.hr_status)}`}>
                                        {viewedLeave.hr_status}
                                    </span>
                                    {viewedLeave.hr_status === 'REJECTED' && viewedLeave.hr_rejection_reason && (
                                        <p className="rounded border px-3 py-2 bg-red-50 text-red-800 mt-2">Reason: {viewedLeave.hr_rejection_reason}</p>
                                    )}
                                </div>
                            )}

                            {/* Display Manager Status and Reason */}
                            {viewedLeave.manager_status && (
                                <div>
                                    <p className="mb-1 font-semibold">Manager Status:</p>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(viewedLeave.manager_status)}`}>
                                        {viewedLeave.manager_status}
                                    </span>
                                    {viewedLeave.manager_status === 'REJECTED' && viewedLeave.manager_rejection_reason && (
                                        <p className="rounded border px-3 py-2 bg-red-50 text-red-800 mt-2">Reason: {viewedLeave.manager_rejection_reason}</p>
                                    )}
                                </div>
                            )}

                            {canUpdateStatus && ( // Show buttons if user is HR or Manager
                                <div className="flex justify-between mt-4">
                                    <Button
                                        type="button"
                                        label="Accepted"
                                        className='bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                                        onClick={() => handleStatusButtonClick('ACCEPTED')}
                                        disabled={isSubmittingStatus || viewedLeave.status === 'ACCEPTED'}
                                    />
                                    <Button
                                        type="button"
                                        label="Rejected"
                                        onClick={() => handleStatusButtonClick('REJECTED')}
                                        variant="danger"
                                        disabled={isSubmittingStatus || viewedLeave.status === 'REJECTED'}
                                    />
                                </div>
                            )}
                            <div className="flex justify-end">
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
                        </div>
                    </div>
                </div>
            )}

            {/* Leave Table */}
            <div>
                <h3 className="mb-4 text-xl font-semibold">Accepted Leave Table</h3>
                <Table
                    columns={columns}
                    data={leaves}
                    currentPage={currentPage}
                    itemsPerPage={itemsPerPage}
                    actions={(leave) => {
                        return (
                            <div className="relative">
                                <ActionButtons
                                    showView={true}
                                    onView={() => handleView(leave)}
                                    showStatusUpdate={canUpdateStatus}
                                />
                            </div>
                        );
                    }}
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
    );
}