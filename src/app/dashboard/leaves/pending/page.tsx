'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useProtectRoute from '@/hooks/useProtectRoute';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FiChevronDown } from 'react-icons/fi'; // Still imported but not used in the form now

import callApi from '@/utils/callApi';
import ActionButtons from '@/components/ActionButtons';
import Table from '@/components/Table';
import Loader from '@/components/Loader';
import Button from "@/components/Button";
import Pagination from '@/components/Pagination';
// import CreateLeaveModal from '@/components/CreateLeaveModal'; // REMOVED: Form logic moved here
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
    const [isFormSubmitting, setIsFormSubmitting] = useState(false); // New state for form submission

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;

    const queryClient = useQueryClient();

    // Leave Form Handling (New Section)
    const validationSchema = Yup.object({
        // Leave Type is now a string input, no longer restricted by .oneOf
        leave_type: Yup.string().max(50, 'Leave Type cannot exceed 50 characters').required('Leave Type is required'),
        start_date: Yup.date().required('Start Date is required').typeError('Invalid date format'),
        end_date: Yup.date().required('End Date is required').typeError('Invalid date format').min(
            Yup.ref('start_date'),
            'End Date must be on or after Start Date'
        ),
        description: Yup.string().max(500, 'Description cannot exceed 500 characters').required('Description is required'),
    });

    const formik = useFormik({
        initialValues: {
            leave_type: '', // Default to empty string for custom input
            start_date: '',
            end_date: '',
            description: '',
        },
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            setIsFormSubmitting(true);
            const baseUrl = process.env.NEXT_PUBLIC_API_URL;
            const url = editId ? `${baseUrl}/leaves/${editId}` : `${baseUrl}/leaves`;
            const method = editId ? 'put' : 'post';

            try {
                await callApi(method, url, values, {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                });

                toast.success(`Leave request ${editId ? 'updated' : 'created'} successfully!`);

                queryClient.invalidateQueries({ queryKey: ['pendingLeaves'] });
                queryClient.invalidateQueries({ queryKey: ['allLeaves'] });
                setCurrentPage(1);

                setShowForm(false);
                setEditId(null);
                setEditLeaveData(null);
                resetForm();
            } catch (error: any) {
                toast.error(error?.response?.data?.detail || 'Failed to submit leave request');
            } finally {
                setIsFormSubmitting(false);
            }
        },
        enableReinitialize: true,
    });

    // Effect to set form values when editing
    useEffect(() => {
        if (editLeaveData) {
            formik.setValues({
                leave_type: editLeaveData.leave_type || '', 
                start_date: editLeaveData.start_date.split('T')[0] || '', // Ensures date is correctly formatted
                end_date: editLeaveData.end_date.split('T')[0] || '', // Ensures date is correctly formatted
                description: editLeaveData.description || '',
            }, false); // Pass false for deep value check
        } else {
            formik.resetForm();
        }
    }, [editLeaveData]);
    // End Leave Form Handling

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

    // ----------------------------------------------------------------------
    // Create/Update Leave Form Block (Integrated and Styled)
    // ----------------------------------------------------------------------
    if(showForm){ 
        return(
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mt-10 max-w-6xl rounded bg-white p-6 shadow relative">
                    {isFormSubmitting && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-white bg-opacity-80">
                            <Loader />
                        </div>
                    )}
                    <h3 className="mb-6 text-2xl font-semibold text-gray-700">
                        {editId ? 'Update Leave Request' : 'Create New Leave Request'}
                    </h3>
                    
                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        
                        {/* Leave Type Input (Text) */}
                        <div>
                            <label htmlFor="leave_type" className="mb-2.5 block text-sm font-medium text-black">Leave Type</label>
                            <input
                                type="text"
                                id="leave_type"
                                name="leave_type"
                                placeholder='e.g., Sick Leave, Vacation, Personal Time Off'
                                value={formik.values.leave_type}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`
                                    w-full rounded-lg border py-4 pl-6 pr-6 text-black outline-none transition duration-300
                                    ${
                                        formik.touched.leave_type && formik.errors.leave_type ? 'border-red-500' : 'border-gray-300'
                                    }
                                    focus:border-purple-600
                                `}
                                disabled={isFormSubmitting}
                            />
                            {formik.touched.leave_type && formik.errors.leave_type && (
                                <span className="mt-1 block text-sm text-red-500">{formik.errors.leave_type}</span>
                            )}
                        </div>

                        {/* Start Date */}
                        <div>
                            <label htmlFor="start_date" className="mb-2.5 block text-sm font-medium text-black">Start Date</label>
                            <input
                                type="date"
                                id="start_date"
                                name="start_date"
                                value={formik.values.start_date}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`
                                    w-full rounded-lg border py-4 pl-6 pr-6 text-black outline-none transition duration-300
                                    ${
                                        formik.touched.start_date && formik.errors.start_date ? 'border-red-500' : 'border-gray-300'
                                    }
                                    focus:border-purple-600
                                `}
                                disabled={isFormSubmitting}
                            />
                            {formik.touched.start_date && formik.errors.start_date && (
                                <span className="mt-1 block text-sm text-red-500">{formik.errors.start_date}</span>
                            )}
                        </div>

                        {/* End Date */}
                        <div>
                            <label htmlFor="end_date" className="mb-2.5 block text-sm font-medium text-black">End Date</label>
                            <input
                                type="date"
                                id="end_date"
                                name="end_date"
                                value={formik.values.end_date}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className={`
                                    w-full rounded-lg border py-4 pl-6 pr-6 text-black outline-none transition duration-300
                                    ${
                                        formik.touched.end_date && formik.errors.end_date ? 'border-red-500' : 'border-gray-300'
                                    }
                                    focus:border-purple-600
                                `}
                                disabled={isFormSubmitting}
                            />
                            {formik.touched.end_date && formik.errors.end_date && (
                                <span className="mt-1 block text-sm text-red-500">{formik.errors.end_date}</span>
                            )}
                        </div>

                        {/* Description Textarea */}
                        <div>
                            <label htmlFor="description" className="mb-2.5 block text-sm font-medium text-black">Description</label>
                            <div className="relative">
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder='Briefly describe the reason for your leave...'
                                    rows={4}
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className={`
                                        w-full rounded-lg border py-4 pl-6 pr-6 text-black outline-none transition duration-300
                                        ${
                                            formik.touched.description && formik.errors.description ? 'border-red-500' : 'border-gray-300'
                                        }
                                        focus:border-purple-600
                                    `}
                                    disabled={isFormSubmitting}
                                />
                            </div>
                            {formik.touched.description && formik.errors.description && (
                                <span className="mt-1 block text-sm text-red-500">{formik.errors.description}</span>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end gap-4 pt-4">
                            <Button
                                label="Cancel"
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditId(null);
                                    setEditLeaveData(null);
                                    formik.resetForm();
                                }}
                                variant="secondary"
                                disabled={isFormSubmitting}
                            />
                            <Button
                                label={editId ? 'Update Request' : 'Submit Request'}
                                type="submit"
                                variant="primary"
                                disabled={isFormSubmitting}
                            />
                        </div>
                    </form>
                </div>
            </div>
        );
    }
    // ----------------------------------------------------------------------

    // ----------------------------------------------------------------------
    // View Leave Modal
    // ----------------------------------------------------------------------
    if(showViewForm && viewedLeave){
        return (
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mt-10 max-w-6xl rounded bg-white p-6 shadow relative">
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
                            <p className="text-gray-900">{viewedLeave.description}</p>
                        </div>

                        {/* Overall Status */}
                        <div className='bg-gray-50 p-4 rounded-lg'>
                            <p className="mb-1 font-semibold text-gray-600">Overall Status:</p>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold mt-2 ${getStatusColor(viewedLeave.status || 'PENDING')}`}>
                                {viewedLeave.status || 'PENDING'}
                            </span>
                        </div>
                        {/* HR Status */}
                        {viewedLeave.hr_status && (
                            <div className='bg-gray-50 p-4 rounded-lg'>
                                <p className="mb-1 font-semibold text-gray-600">HR Status:</p>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(viewedLeave.hr_status)}`}>
                                    {viewedLeave.hr_status}
                                </span>
                                {viewedLeave.hr_status === 'REJECTED' && viewedLeave.hr_rejection_reason && (
                                    <p className="rounded border px-3 py-2 bg-red-100 text-red-800 mt-2">Reason: {viewedLeave.hr_rejection_reason}</p>
                                )}
                                {viewedLeave.reviewer_id && (
                                    <p className="mt-2 text-sm text-gray-600">Reviewed by (HR): {usersMap.get(viewedLeave.reviewer_id) || 'Loading...'}</p>
                                )}
                            </div>
                        )}

                        {/* Manager Status */}
                        {viewedLeave.manager_status && (
                            <div className='bg-gray-50 p-4 rounded-lg'>
                                <p className="mb-1 font-semibold text-gray-600">Manager Status:</p>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(viewedLeave.manager_status)}`}>
                                    {viewedLeave.manager_status}
                                </span>
                                {viewedLeave.manager_status === 'REJECTED' && viewedLeave.manager_rejection_reason && (
                                    <p className="rounded border px-3 py-2 bg-red-100 text-red-800 mt-2">Reason: {viewedLeave.manager_rejection_reason}</p>
                                )}
                                {viewedLeave.manager_id && (
                                    <p className="mt-2 text-sm text-gray-600">Reviewed by (Manager): {usersMap.get(viewedLeave.manager_id) || 'Loading...'}</p>
                                )}
                            </div>
                        )}

                        {/* Status Update Buttons */}
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
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
    // ----------------------------------------------------------------------

    // ----------------------------------------------------------------------
    // Main Table View 
    // ----------------------------------------------------------------------
    return (
        <div className="min-h-screen p-4 bg-gray-100">
            <div className="mx-auto mt-10 max-w-6xl max-w-full xl:max-w-7xl rounded bg-white p-6 shadow">
                {/* Header / Action Button */}
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-2xl font-semibold text-gray-700">Pending Leave Requests</h3>
                    {!isManager && (
                        <Button
                            label="Create Leave"
                            onClick={() => {
                                setShowForm(true);
                                setEditId(null);
                                setEditLeaveData(null);
                                formik.resetForm();
                            }}
                            variant="primary"
                            disabled={isFormSubmitting}
                            className="w-full sm:w-auto px-4 py-2"
                        />
                    )}
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
                                    showUpdate={!isManager} // Only show edit for non-managers (employees can edit their own pending requests)
                                    onUpdate={() => handleEdit(leave)}
                                    showDelete={!isManager} // Only show delete for non-managers
                                    onDelete={() => leave.id && deleteMutation.mutate(leave.id)}
                                    isDeleting={deletingLeaveId === leave.id}
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
            </div>
        </div>
    );
}
