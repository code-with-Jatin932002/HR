
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useProtectRoute from '@/hooks/useProtectRoute';

import callApi from '@/utils/callApi';
import ActionButtons from '@/components/ActionButtons';
import Table from '@/components/Table'; // Ensure Table.tsx is updated as well
import Loader from '@/components/Loader';
import Button from "@/components/Button";
import Pagination from '@/components/Pagination';

const MySwal = withReactContent(Swal);

// Custom hook to get user role from localStorage
const useUserRole = () => {
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const userRole = sessionStorage.getItem('role_type');
        setRole(userRole);
    }, []);

    return role;
};

/**
 * Returns the Tailwind CSS classes for a given status to apply different background and text colors.
 * @param status The status string (e.g., 'ACCEPTED', 'REJECTED', 'Pending').
 * @returns Tailwind CSS classes for status styling.
 */
function getStatusColor(status: string) {
    switch (status) {
        case 'ACCEPTED':
            return 'bg-green-100 text-green-700';
        case 'REJECTED':
            return 'bg-red-100 text-red-700';
        default:
            return 'bg-yellow-100 text-yellow-700';
    }
}

/**
 * Defines the columns for the leave records table.
 * Includes a custom render function for the 'Status' column to apply styling.
 */
const columns = [
    { label: 'Leave Type', key: 'leave_type' },
    { label: 'Description', key: 'description' },
    { label: 'From', key: 'start_date' },
    { label: 'To', key: 'end_date' },
    {
        label: 'Status',
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
];

interface Leave {
    id?: string;
    leave_type: string;
    description: string;
    start_date: string;
    end_date: string;
    status?: string; // This will hold 'ACCEPTED', 'REJECTED', or 'Pending'
}

export default function LeavesPage() {
    useProtectRoute();
    const userRole = useUserRole();

    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [isSubmittingForm, setIsSubmittingForm] = useState(false);
    const [deletingLeaveId, setDeletingLeaveId] = useState<string | null>(null);

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
        const responseData = await callApi('get', `${baseUrl}/leaves?page=${currentPage}&limit=${itemsPerPage}`, null, {
            Authorization: `Bearer ${token}`,
        });
        return responseData;
    };

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['leaves', currentPage, itemsPerPage],
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
            MySwal.fire({
                icon: 'success',
                title: editId ? 'Leave updated successfully' : 'Leave submitted successfully',
                timer: 1500,
                showConfirmButton: false,
            });
            setShowForm(false);
            setEditId(null);
            formik.resetForm();
        },
        onError: (error: any) => {
            MySwal.fire('Error', error?.response?.data?.detail || 'Failed to submit leave', 'error');
        },
        onSettled: () => {
            setIsSubmittingForm(false);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL;
            return await callApi('delete', `${baseUrl}/leaves/${id}`, null, {
                Authorization: `Bearer ${token}`,
            });
        },
        onMutate: (id) => {
            setDeletingLeaveId(id);
        },
        onSuccess: async () => {
            await refetch();
            MySwal.fire('Deleted!', 'Leave has been deleted.', 'success');
        },
        onError: (error: any) => {
            MySwal.fire('Error', error?.response?.data?.detail || 'Failed to delete leave', 'error');
        },
        onSettled: () => {
            setDeletingLeaveId(null);
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ leaveId, status }: { leaveId: string, status: string }) => {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL;
            return await callApi('patch', `${baseUrl}/leaves/${leaveId}/status`, { status }, {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            });
        },
        onMutate: () => {
            setIsSubmittingStatus(true);
        },
        onSuccess: async (data, variables) => {
            await refetch();
            MySwal.fire({
                icon: 'success',
                title: `Leave ${variables.status.toLowerCase()} successfully`,
                timer: 1500,
                showConfirmButton: false,
            });
            setShowViewForm(false); // Close the view form after status update
            setViewedLeave(null);
        },
        onError: (error: any) => {
            MySwal.fire('Error', error?.response?.data?.detail || 'Failed to update leave status', 'error');
        },
        onSettled: () => {
            setIsSubmittingStatus(false);
        },
    });

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

    const handleDelete = async (id: string) => {
        const confirm = await MySwal.fire({
            title: 'Are you sure?',
            text: 'You are about to delete this leave record!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (confirm.isConfirmed) {
            deleteMutation.mutate(id);
        }
    };

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

    const handleStatusButtonClick = (status: 'ACCEPTED' | 'REJECTED') => {
        if (viewedLeave?.id) {
            updateStatusMutation.mutate({
                leaveId: viewedLeave.id,
                status: status
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
                <p>Failed to load leave records. Please try again.</p>
                <Button onClick={() => refetch()} label="Retry" variant="primary" className="mt-4" />
            </div>
        );
    }

    // Determine if the current user role can update leave statuses
    const canUpdateStatus = userRole === 'Hr' || userRole === 'Manager';

    return (
        <div className="min-h-screen p-6 bg-gray-100">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold">Leave Records</h1>
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

            {/* Form Modal for Create/Update Leave (No changes needed here) */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
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

            {/* View Leave Modal (New) */}
            {showViewForm && viewedLeave && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
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
                                <p className="mb-1 font-semibold">Status:</p>
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(viewedLeave.status || 'Pending')}`}
                                >
                                    {viewedLeave.status || 'Pending'}
                                </span>
                            </div>
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
                <h3 className="mb-4 text-xl font-semibold">Leave Table</h3>
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
                                    onUpdate={() => handleEdit(leave)}
                                    onDelete={() => handleDelete(leave.id!)}
                                    // Show status update actions if the user is HR or Manager
                                    showStatusUpdate={canUpdateStatus}
                                />
                                {deletingLeaveId === leave.id && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-md">
                                        <Loader />
                                    </div>
                                )}
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