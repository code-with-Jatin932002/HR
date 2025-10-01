'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useProtectRoute from '@/hooks/useProtectRoute';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

import callApi from '@/utils/callApi';
import ActionButtons from '@/components/ActionButtons';
import Table from '@/components/Table';
import Loader from '@/components/Loader';
import Button from "@/components/Button";
import Pagination from '@/components/Pagination';
import CreateLeaveModal from '@/components/CreateLeaveModal';
import { FiX } from 'react-icons/fi';

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
    status?: string;
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
        default:
            return 'bg-gray-100 text-gray-700';
    }
}

export default function PendingLeavesPage() {
    useProtectRoute();
    const userRole = useUserRole();
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [editLeaveData, setEditLeaveData] = useState<Leave | null>(null);
    const [deletingLeaveId, setDeletingLeaveId] = useState<string | null>(null);
    const [showViewForm, setShowViewForm] = useState(false);
    const [viewedLeave, setViewedLeave] = useState<Leave | null>(null);
    const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;

    const queryClient = useQueryClient();

    // Fetch leaves data
    const {
        data: leavesData,
        isLoading: isLoadingLeaves,
        isError: isErrorLeaves,
        refetch: refetchLeaves
    } = useQuery<LeaveApiResponse, Error, LeaveApiResponse, ['pendingLeaves', number, number]>({
        queryKey: ['pendingLeaves', currentPage, itemsPerPage],
        queryFn: async ({ queryKey }) => {
            const [_key, page, limit] = queryKey;
            if (!token) throw new Error('Authentication token not found.');
            const baseUrl = process.env.NEXT_PUBLIC_API_URL;
            return await callApi('get', `${baseUrl}/leaves?page=${page}&limit=${limit}&status=PENDING`, null, {
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
        },
        onSuccess: async (data, variables) => {
            await refetchLeaves();
            toast.success(`Leave ${variables.status.toLowerCase()} successfully`);
            setShowViewForm(false);
            setViewedLeave(null);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.detail || 'Failed to update leave status');
        },
        onSettled: () => {
            setIsSubmittingStatus(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (leaveId: string) => {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL;
            return await callApi('delete', `${baseUrl}/leaves/${leaveId}`, null, {
                Authorization: `Bearer ${token}`,
            });
        },
        onMutate: (leaveId) => {
            setDeletingLeaveId(leaveId);
            toast.loading('Deleting leave...');
        },
        onSuccess: async () => {
            await refetchLeaves();
            toast.dismiss();
            toast.success('Leave deleted successfully');
        },
        onError: (error: any) => {
            toast.dismiss();
            toast.error(error?.response?.data?.detail || 'Failed to delete leave');
        },
        onSettled: () => {
            setDeletingLeaveId(null);
        },
    });

    const handleEdit = (leave: Leave) => {
        setEditId(leave.id || null);
        setEditLeaveData(leave);
        setShowForm(true);
    };

    const handleView = (leave: Leave) => {
        setViewedLeave(leave);
        setShowViewForm(true);
    };

    const handleStatusButtonClick = async (status: 'ACCEPTED' | 'REJECTED') => {
        if (viewedLeave?.id) {
            let reason = '';
            if (status === 'REJECTED') {
                const { value: responseReason } = await Swal.fire({
                    title: 'Reason for rejection',
                    input: 'textarea',
                    inputPlaceholder: 'Type your reason here...',
                    inputAttributes: {
                        'aria-label': 'Type your reason here...',
                    },
                    showCancelButton: true,
                    inputValidator: (value: string) => {
                        if (!value) {
                            return 'You need to write a reason!';
                        }
                        return null;
                    },
                });
                if (responseReason === undefined) {
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
                <p>Failed to load pending leave records. Please try again.</p>
                <Button onClick={() => refetchLeaves()} label="Retry" variant="primary" className="mt-4" />
            </div>
        );
    }

    const canUpdateStatus = userRole === 'hr' || userRole === 'manager';
    const isManager = userRole === 'manager';

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
            render: (leave: Leave) => {
                const status = leave.hr_status || 'N/A';
                return (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
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
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                        {status}
                    </span>
                );
            },
        },
    ];
            {/* View Leave Modal (Updated) */}
            if(showViewForm && viewedLeave){
                 return (
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto mt-10 w-full rounded bg-white p-6 shadow">
                        {isSubmittingStatus && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-white bg-opacity-80">
                                <Loader />
                            </div>
                        )}
                        <h3 className="mb-4 text-xl font-semibold text-gray-700">Leave Details</h3>
                           <Button
                                    type="button"
                                    className='justify-end ml-270 -mt-10 bg-color-red'
                                    label="X"
                                    onClick={() => {
                                        setShowViewForm(false);
                                        setViewedLeave(null);
                                    }}
                                    variant="secondary"
                                />
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <p className="mb-1 font-semibold text-gray-600">Employee Name:</p>
                                <p className="rounded-xl border px-3 py-2 border-gray-200 bg-purple-50 p-4 text-gray-600">{usersMap.get(viewedLeave.user_id) || 'Loading...'}</p>
                            </div>
                            <div>
                                <p className="mb-1 font-semibold text-gray-600">Leave Type:</p>
                                <p className="rounded-xl border px-3 py-2 border-gray-200 bg-purple-50 p-4 text-gray-600">{viewedLeave.leave_type}</p>
                            </div>
                            <div>
                                <p className="mb-1 font-semibold text-gray-600">Description:</p>
                                <p className="rounded-xl border px-3 py-2 border-gray-200 bg-purple-50 p-4 text-gray-600">{viewedLeave.description}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className=''>
                                    <p className="mb-1 font-semibold text-gray-600 text-gray-600">From:</p>
                                    <p className="rounded-xl border px-3 py-2 border-gray-200 bg-purple-50 p-4 text-gray-600">{viewedLeave.start_date}</p>
                                </div>
                                <div>
                                    <p className="mb-1 font-semibold text-gray-600 text-gray-600">To:</p>
                                    <p className="rounded-xl border px-3 py-2 border-gray-200 bg-purple-50 p-4 text-gray-600">{viewedLeave.end_date}</p>
                                </div>
                            </div>
                            <div>
                                <p className="mb-1 font-semibold text-gray-600">Overall Status:</p>
                                <span className={` px-3 py-1 rounded-full text-sm font-semibold mt-2 ${getStatusColor(viewedLeave.status || 'Pending')}`}>
                                    {viewedLeave.status || 'Pending'}
                                </span>
                            </div>

                            {viewedLeave.hr_status && (
                                <div>
                                    <p className="mb-1 font-semibold text-gray-600">HR Status:</p>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(viewedLeave.hr_status)}`}>
                                        {viewedLeave.hr_status}
                                    </span>
                                    {viewedLeave.hr_status === 'REJECTED' && viewedLeave.hr_rejection_reason && (
                                        <p className="rounded border px-3 py-2 bg-red-50 text-red-800 mt-2">Reason: {viewedLeave.hr_rejection_reason}</p>
                                    )}
                                    {viewedLeave.reviewer_id && (
                                        <p className="mt-2 text-sm text-gray-600">Reviewed by: {usersMap.get(viewedLeave.reviewer_id) || 'Loading...'}</p>
                                    )}
                                </div>
                            )}

                            {viewedLeave.manager_status && (
                                <div>
                                    <p className="mb-1 font-semibold text-gray-600">Manager Status:</p>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(viewedLeave.manager_status)}`}>
                                        {viewedLeave.manager_status}
                                    </span>
                                    {viewedLeave.manager_status === 'REJECTED' && viewedLeave.manager_rejection_reason && (
                                        <p className="rounded border px-3 py-2 bg-red-50 text-red-800 mt-2">Reason: {viewedLeave.manager_rejection_reason}</p>
                                    )}
                                    {viewedLeave.manager_id && (
                                        <p className="mt-2 text-sm text-gray-600">Reviewed by: {usersMap.get(viewedLeave.manager_id) || 'Loading...'}</p>
                                    )}
                                </div>
                            )}
                            {/* <div className='flex justify-end gap-2 ml-50 mb-50'>
                        <Button
                                    type="button"
                                    label="Close"
                                    onClick={() => {
                                        setShowViewForm(false);
                                        setViewedLeave(null);
                                    }}
                                    variant="secondary"
                                />
                              </div> */}
                            {canUpdateStatus && (
                                <div className="flex justify-end gap-2 mt-9">
                                   
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
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }
 return (
  <div className="min-h-screen p-4 bg-gray-100">
    {/* Header / Action Button */}
    {!showForm && (
      <div className="mb-6 flex items-center justify-end">
        {!isManager && (
          <Button
            label="Create Leave"
            onClick={() => {
              setShowForm(true);
              setEditId(null);
              setEditLeaveData(null);
            }}
            variant="primary"
            disabled={false}
          />
        )}
      </div>
    )}

    {/* Conditional Rendering */}
    {showForm ? (
      <CreateLeaveModal
        showForm={showForm}
        setShowForm={setShowForm}
        editId={editId}
        setEditId={setEditId}
        initialLeaveData={editLeaveData}
        onSuccess={() => {
          setShowForm(false); // close form after success
          refetchLeaves();    // refresh table
        }}
      />
    ) : (
      // Leave Table
      <div>
        <h3 className="mb-4 text-2xl font-semibold text-gray-700">Pending Leave Table</h3>
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
                showUpdate={true}
                onUpdate={() => {
                  setShowForm(true);
                  setEditId(leave.id);
                  setEditLeaveData(leave); // prefill modal for editing
                }}
                showDelete={true}
                onDelete={() => leave.id && deleteMutation.mutate(leave.id)}
                isDeleting={deletingLeaveId === leave.id}
                showStatusUpdate={canUpdateStatus}
              />
            </div>
          )}
        />

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing{' '}
            <span className="font-medium">
              {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
            </span>{' '}
            to{' '}
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
    )}
  </div>
);
}