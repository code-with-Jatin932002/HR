// pending.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useProtectRoute from '@/hooks/useProtectRoute';
import toast from 'react-hot-toast'; // Import react-hot-toast
 import Swal from 'sweetalert2';

import callApi from '@/utils/callApi';
import ActionButtons from '@/components/ActionButtons';
import Table from '@/components/Table';
import Loader from '@/components/Loader';
import Button from "@/components/Button";
import Pagination from '@/components/Pagination';

// Removed MySwal as it's not used

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

export default function PendingLeavesPage() {
    useProtectRoute();
    const userRole = useUserRole();
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);
    const [deletingLeaveId, setDeletingLeaveId] = useState<string | null>(null); // State to track deleting leave

    const [showViewForm, setShowViewForm] = useState(false);
    const [viewedLeave, setViewedLeave] = useState<Leave | null>(null);
    const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);


    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;

    const queryClient = useQueryClient();
    const fetchLeaves = async ({ queryKey }: { queryKey: any[] }) => {
        const [_key, currentPage, itemsPerPage] = queryKey;
        if (!token) {
            throw new Error('Authentication token not found. Please log in.');
        }
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        // Fetch only PENDING leaves
        const responseData = await callApi('get', `${baseUrl}/leaves?page=${currentPage}&limit=${itemsPerPage}&status=PENDING`, null, {
            Authorization: `Bearer ${token}`,
        });
        return responseData;
    };

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['pendingLeaves', currentPage, itemsPerPage], // Updated query key
        queryFn: fetchLeaves,
        placeholderData: (previousData) => previousData,
        enabled: !!token,
    });
    const leaves = data?.leaves || [];
    const totalItems = data?.totalItems || 0;
    const totalPages = data?.totalPages || 1;

    const leaveMutation = useMutation({
        mutationFn: async (values: Leave) => {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL;
            const url = editId ? `${baseUrl}/leaves/${editId}` : `${baseUrl}/leaves`;
            const method = editId ? 'put' : 'post';
            return await callApi(method, url, values, {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            });
        },
        onMutate: () => {
            setIsSubmittingForm(true);
        },
        onSuccess: async () => {
            await refetch();
            toast.success(editId ? 'Leave updated successfully' : 'Leave submitted successfully');
            setShowForm(false);
            setEditId(null);
            formik.resetForm();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.detail || 'Failed to submit leave');
        },
        onSettled: () => {
            setIsSubmittingForm(false);
        },
    });

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
            await refetch();
            toast.success(`Leave ${variables.status.toLowerCase()} successfully`);
            setShowViewForm(false); // Close the view form after status update
            setViewedLeave(null);
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.detail || 'Failed to update leave status');
        },
        onSettled: () => {
            setIsSubmittingStatus(false);
        },
    });

    // --- Delete Mutation ---
    const deleteMutation = useMutation({
        mutationFn: async (leaveId: string) => {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL;
            return await callApi('delete', `${baseUrl}/leaves/${leaveId}`, null, {
                Authorization: `Bearer ${token}`,
            });
        },
        onMutate: (leaveId) => {
            setDeletingLeaveId(leaveId); // Set the ID of the leave being deleted
            toast.loading('Deleting leave...'); // Show loading toast
        },
        onSuccess: async () => {
            await refetch();
            toast.dismiss(); // Dismiss the loading toast
            toast.success('Leave deleted successfully'); // Show success toast
        },
        onError: (error: any) => {
            toast.dismiss(); // Dismiss the loading toast
            toast.error(error?.response?.data?.detail || 'Failed to delete leave'); // Show error toast
        },
        onSettled: () => {
            setDeletingLeaveId(null); // Clear the deleting state
        },
    });
    // --- End Delete Mutation ---

    const formik = useFormik({
        initialValues: {
            leave_type: '',
            description: '',
            start_date: '',
            end_date: '',
        },
        validationSchema: Yup.object({
            leave_type: Yup.string().required('Leave type is required'),
            description: Yup.string()
                .min(10, 'Description must be at least 10 characters')
                .required('Description is required'),
            start_date: Yup.string()
                .required('Start date is required')
                .test(
                    'is-today-or-future',
                    'Start date must be today or in the future',
                    function (value) {
                        if (!value) return true;
                        const today = new Date();
                        const selectedDate = new Date(value);
                        // Normalize both dates (remove time portion)
                        today.setHours(0, 0, 0, 0);
                        selectedDate.setHours(0, 0, 0, 0);
                        return selectedDate >= today;
                    }
                ),
            end_date: Yup.string()
                .required('End date is required')
                .test(
                    'is-after-start',
                    'End date must be after start date',
                    function (end_date) {
                        const { start_date } = this.parent;
                        return start_date && end_date ? new Date(end_date) >= new Date(start_date) : true;
                    },
                ),
        }),
        onSubmit: (values) => {
            leaveMutation.mutate(values);
        },
    });

    const handleEdit = (leave: Leave) => {
        setEditId(leave.id || null);
        formik.setValues({
            leave_type: leave.leave_type,
            description: leave.description,
            start_date: leave.start_date,
            end_date: leave.end_date,
        });
        setShowForm(true);
    };

    const handleView = (leave: Leave) => {
        setViewedLeave(leave);
        setShowViewForm(true);
    };

    // --- Removed handleConfirmDelete function ---
    // The onDelete will now directly call deleteMutation.mutate

    const handleStatusButtonClick = async (status: 'ACCEPTED' | 'REJECTED') => {
        if (viewedLeave?.id) {
            let reason = '';
            if (status === 'REJECTED') {
                // If you still want a reason input for rejection, you'll need SweetAlert2 or a custom modal here.
                // For now, I'm assuming you still want a reason if rejecting.
                // If you remove SweetAlert2 completely, you'd need to replace this with your own input modal.
                // Keeping the SweetAlert2 part for rejection reason for now, as it's common.
                const { value: responseReason } = await Swal.fire({ // Changed back to Swal directly if not using MySwal
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
                if (responseReason === undefined) { // User clicked cancel
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
                <p>Failed to load pending leave records. Please try again.</p>
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
            label: 'Overall Status', // Changed label for clarity
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
        { // New column for HR Status
            label: 'HR Status',
            key: 'hr_status',
            render: (leave: any) => {
                const status = leave.hr_status || 'N/A'; // Display 'N/A' if not set
                return (
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}
                    >
                        {status}
                    </span>
                );
            },
        },
        { // New column for Manager Status
            label: 'Manager Status',
            key: 'manager_status',
            render: (leave: any) => {
                const status = leave.manager_status || 'N/A'; // Display 'N/A' if not set
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
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-3xl font-bold">Pending Leave Records</h2>
                <Button
                    label="Create Leave"
                    onClick={() => {
                        setShowForm(true);
                        setEditId(null);
                        formik.resetForm();
                    }}
                    variant="primary"
                    disabled={isSubmittingForm}
                />
            </div>

            {/* Form Modal for Create/Update Leave */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg overflow-y-auto max-h-[90vh]">
                        {isSubmittingForm && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-white bg-opacity-80">
                                <Loader />
                            </div>
                        )}
                        <h3 className="mb-4 text-xl font-semibold">
                            {editId ? 'Update Leave' : 'Create Leave'}
                        </h3>
                        <form onSubmit={formik.handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block font-semibold">Leave Type</label>
                                <input
                                    type="text"
                                    name="leave_type"
                                    value={formik.values.leave_type}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="w-full rounded border px-3 py-2"
                                    disabled={isSubmittingForm}
                                />
                                {formik.touched.leave_type && formik.errors.leave_type && (
                                    <span className="text-sm text-red-500">{formik.errors.leave_type}</span>
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block font-semibold">Description</label>
                                <textarea
                                    name="description"
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="w-full px-3 py-2 border rounded"
                                    disabled={isSubmittingForm}
                                />
                                {formik.touched.description && formik.errors.description && (
                                    <span className="text-sm text-red-500">{formik.errors.description}</span>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block font-semibold">Start Date</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formik.values.start_date}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className="w-full rounded border px-3 py-2"
                                        disabled={isSubmittingForm}
                                    />
                                    {formik.touched.start_date && formik.errors.start_date && (
                                        <span className="text-sm text-red-500">{formik.errors.start_date}</span>
                                    )}
                                </div>
                                <div>
                                    <label className="mb-1 block font-semibold">End Date</label>
                                    <input
                                        type="date"
                                        name="end_date"
                                        value={formik.values.end_date}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        className="w-full rounded border px-3 py-2"
                                        disabled={isSubmittingForm}
                                    />
                                    {formik.touched.end_date && formik.errors.end_date && (
                                        <span className="text-sm text-red-500">{formik.errors.end_date}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <Button
                                    type="button"
                                    label="Cancel"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditId(null);
                                        formik.resetForm();
                                    }}
                                    variant="secondary"
                                    disabled={isSubmittingForm}
                                />
                                <Button
                                    type="submit"
                                    label={editId ? 'Update Leave' : 'Submit Leave'}
                                    variant="success"
                                    disabled={isSubmittingForm}
                                />
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Leave Modal (Updated) */}
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
                                        onClick={() => handleStatusButtonClick('ACCEPTED')}
                                        variant="success"
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
                <h3 className="mb-4 text-xl font-semibold">Pending Leave Table</h3>
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
                                    showUpdate={true}
                                    onUpdate={() => handleEdit(leave)}
                                    showDelete={true}
                                    onDelete={() => leave.id && deleteMutation.mutate(leave.id)} // Directly call mutate
                                    isDeleting={deletingLeaveId === leave.id}
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