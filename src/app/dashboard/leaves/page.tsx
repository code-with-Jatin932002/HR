
'use client';

import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useProtectRoute from '@/hooks/useProtectRoute';

import callApi from '@/utils/callApi';
import ActionButtons from '@/components/ActionButtons';
import Table from '@/components/Table';

const MySwal = withReactContent(Swal);

function getStatusColor(status: string) {
  switch (status) {
    case 'Approved':
      return 'bg-green-100 text-green-700';
    case 'Rejected':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-yellow-100 text-yellow-700';
  }
}

const columns = [
  { label: 'Leave Type', key: 'leave_type' },
  { label: 'Description', key: 'description' },
  { label: 'From', key: 'start_date' },
  { label: 'To', key: 'end_date' },
  // { label: 'Status', key: 'status' }, // We'll customize it via actions
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
}
];

interface Leave {
  id?: number;
  leave_type: string;
  description: string;
  start_date: string;
  end_date: string;
}

export default function LeavesPage() {
  useProtectRoute();
  
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const queryClient = useQueryClient();

  // ✅ Fetch Leaves with React Query
  const { data: leaves = [], isLoading } = useQuery<Leave[]>({
    queryKey: ['leaves'],
    queryFn: async () => {
      const data = await callApi('get', 'http://127.0.0.1:5000/leaves', null, {
        Authorization: `Bearer ${token}`,
      });
      return Array.isArray(data) ? data : [];
    },
  });

  // ✅ Create or Update Leave
  const leaveMutation = useMutation({
    mutationFn: async (values: Leave) => {
      const url = editId
        ? `http://127.0.0.1:5000/leaves/${editId}`
        : 'http://127.0.0.1:5000/leaves';
      const method = editId ? 'put' : 'post';

      return await callApi(method, url, values, {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['leaves'] });
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
    onError: () => {
      MySwal.fire('Error', 'Failed to submit leave', 'error');
    },
  });

  // ✅ Delete Leave
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await callApi('delete', `http://127.0.0.1:5000/leaves/${id}`, null, {
        Authorization: `Bearer ${token}`,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['leaves'] });
      MySwal.fire('Deleted!', 'Leave has been deleted.', 'success');
    },
    onError: () => {
      MySwal.fire('Error', 'Failed to delete leave', 'error');
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
      start_date: Yup.string().required('Start date is required'),
      end_date: Yup.string().required('End date is required'),
    }),
    onSubmit: (values) => {
      leaveMutation.mutate(values);
    },
  });

  const handleDelete = async (id: number) => {
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


  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Leave Records</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditId(null);
            formik.resetForm();
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Leave
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg relative">
            <h3 className="text-xl font-semibold mb-4">{editId ? 'Update Leave' : 'Create Leave'}</h3>
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Leave Type</label>
                <input
                  type="text"
                  name="leave_type"
                  value={formik.values.leave_type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-3 py-2 border rounded"
                />
                {formik.touched.leave_type && formik.errors.leave_type && (
                  <span className="text-sm text-red-500">{formik.errors.leave_type}</span>
                )}
              </div>
              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full px-3 py-2 border rounded"
                />
                {formik.touched.description && formik.errors.description && (
                  <span className="text-sm text-red-500">{formik.errors.description}</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    name="start_date"
                    value={formik.values.start_date}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-3 py-2 border rounded"
                  />
                  {formik.touched.start_date && formik.errors.start_date && (
                    <span className="text-sm text-red-500">{formik.errors.start_date}</span>
                  )}
                </div>
                <div>
                  <label className="block font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    name="end_date"
                    value={formik.values.end_date}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-3 py-2 border rounded"
                  />
                  {formik.touched.end_date && formik.errors.end_date && (
                    <span className="text-sm text-red-500">{formik.errors.end_date}</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                  {editId ? 'Update Leave' : 'Submit Leave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leave Table */}
    <div>
      <h3 className="text-xl font-semibold mb-4">Leave Table</h3>
      <Table
  columns={columns}
  data={leaves}
  actions={(leave) => (
    <ActionButtons
      showView={false}
      onUpdate={() => handleEdit(leave)}
      onDelete={() => handleDelete(leave.id)}
    />
  )}
/>
    </div>
    </div>
  );
}