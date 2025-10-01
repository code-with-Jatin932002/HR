'use client';

import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import callApi from '@/utils/callApi';
import Button from '@/components/Button';
import Loader from '@/components/Loader';

// Define the type for the leave object
interface Leave {
    id?: string;
    leave_type: string;
    description: string;
    start_date: string;
    end_date: string;
}

// Define the props for the component
interface CreateLeaveModalProps {
    showForm: boolean;
    setShowForm: (show: boolean) => void;
    editId: string | null;
    setEditId: (id: string | null) => void;
    initialLeaveData?: Leave | null;
    onSuccess: () => void;
}

export default function CreateLeaveModal({
    showForm,
    setShowForm,
    editId,
    setEditId,
    initialLeaveData,
    onSuccess,
}: CreateLeaveModalProps) {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;

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
        onSuccess: async () => {
            onSuccess();
            toast.success(editId ? 'Leave updated successfully' : 'Leave submitted successfully');
            handleClose();
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.detail || 'Failed to submit leave');
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
                    'is-future-date',
                    'Start date must be in the future',
                    function (value) {
                        if (!value) return true;
                        const today = new Date();
                        const selectedDate = new Date(value);
                        today.setHours(0, 0, 0, 0);
                        selectedDate.setHours(0, 0, 0, 0);
                        return selectedDate > today;
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

    useEffect(() => {
        if (showForm && initialLeaveData) {
            formik.setValues(initialLeaveData);
        } else {
            formik.resetForm();
        }
    }, [showForm, initialLeaveData]);

    const handleClose = () => {
        setShowForm(false);
        setEditId(null);
        formik.resetForm();
    };

    if (!showForm) return null;

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mt-10 w-full rounded bg-white p-6 shadow">
                {leaveMutation.isPending && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-white bg-opacity-80">
                        <Loader />
                    </div>
                )}
                <h2 className="mb-4 text-xl font-semibold text-gray-700">
                    {editId ? 'Update Leave' : 'Create Leave'}
                </h2>
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block font-semibold text-gray-600">Leave Type</label>
                        <input
                            type="text"
                            name="leave_type"
                            value={formik.values.leave_type}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="rounded-xl border px-40 py-2 border-gray-200 bg-purple-50 p-4 text-gray-600"
                            disabled={leaveMutation.isPending}
                        />
                        {formik.touched.leave_type && formik.errors.leave_type && (
                            <span className="text-sm text-red-500">{formik.errors.leave_type}</span>
                        )}
                    </div>
                       <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block font-semibold text-gray-600">Start Date</label>
                            <input
                                type="date"
                                name="start_date"
                                value={formik.values.start_date}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="rounded-xl border px-15 py-2 border-gray-200 bg-purple-50 p-4 text-gray-600"
                                disabled={leaveMutation.isPending}
                            />
                            {formik.touched.start_date && formik.errors.start_date && (
                                <span className="text-sm text-red-500">{formik.errors.start_date}</span>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block font-semibold text-gray-600">End Date</label>
                            <input
                                type="date"
                                name="end_date"
                                value={formik.values.end_date}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="rounded-xl border px-15 py-2 border-gray-200 bg-purple-50 p-4 text-gray-600"
                                disabled={leaveMutation.isPending}
                            />
                            {formik.touched.end_date && formik.errors.end_date && (
                                <span className="text-sm text-red-500">{formik.errors.end_date}</span>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block font-semibold text-gray-600">Description</label>
                        <textarea
                            name="description"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            className="rounded-xl border px-43 py-2 border-gray-200 bg-purple-50 p-4 text-gray-600"
                            disabled={leaveMutation.isPending}
                        />
                        {formik.touched.description && formik.errors.description && (
                            <span className="text-sm text-red-500">{formik.errors.description}</span>
                        )}
                    </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-9">
                        <Button
                            type="button"
                            label="Cancel"
                            onClick={handleClose}
                            variant="secondary"
                            disabled={leaveMutation.isPending}
                        />
                        <Button
                            type="submit"
                            label={editId ? 'Update Leave' : 'Submit Leave'}
                            variant="success"
                            disabled={leaveMutation.isPending}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}