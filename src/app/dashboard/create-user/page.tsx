
'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import callApi from '@/utils/callApi';
import useAuthRedirect from '@/hooks/useAuthRedirect';
import useProtectRoute from '@/hooks/useProtectRoute';
import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ActionButtons from '@/components/ActionButtons'; // adjust the path as per your folder structure
import Table from '@/components/Table';

const MySwal = withReactContent(Swal);


const columns = [
  { label: 'First Name', key: 'first_name' },
  { label: 'Last Name', key: 'last_name' },
  { label: 'Email', key: 'email' },
  { label: 'Role ID', key: 'role_id' },
];

const fetchUsers = async () => {
  const token = localStorage.getItem('token');
  return await callApi('get', 'http://127.0.0.1:5000/users', null, {
    Authorization: `Bearer ${token}`,
  });
};

export default function CreateUserPage() {
  useAuthRedirect();
  useProtectRoute();

  const queryClient = useQueryClient();

  const { data: users = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [viewUser, setViewUser] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const validationSchema = useMemo(() => {
    return Yup.object({
      first_name: Yup.string().required('First name is required'),
      last_name: Yup.string().required('Last name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: isUpdate
        ? Yup.string()
        : Yup.string().required('Password is required').min(6),
      role_type: Yup.string().required('Role type is required'),
    });
  }, [isUpdate]);

  const formik = useFormik({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      role_type: 'Admin',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const url = isUpdate
        ? `http://127.0.0.1:5000/users/${selectedUserId}?email=${encodeURIComponent(values.email)}`
        : 'http://127.0.0.1:5000/users';

      const method = isUpdate ? 'put' : 'post';
      const body = isUpdate ? { user_id: selectedUserId } : values;

      try {
        await callApi(method, url, body, {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        });

        await MySwal.fire({
          icon: 'success',
          title: `User ${isUpdate ? 'updated' : 'created'} successfully!`,
          timer: 1500,
          showConfirmButton: false,
        });

        refetch(); // ✅ Re-fetch users after create/update
        setFormOpen(false);
        setIsUpdate(false);
        setSelectedUserId('');
        resetForm();
      } catch (error: any) {
        MySwal.fire('Error', error?.response?.data?.detail || 'Something went wrong', 'error');
      }
    },
  });

  const handleDelete = async (userId: string) => {
    const confirm = await MySwal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this user!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (confirm.isConfirmed) {
      try {
        await callApi('delete', `http://127.0.0.1:5000/users/${userId}`, { user_id: userId }, {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        });

        MySwal.fire('Deleted!', 'User has been deleted.', 'success');
        refetch(); // ✅ Refresh data
      } catch (error: any) {
        MySwal.fire('Error', error?.response?.data?.detail || 'Failed to delete user', 'error');
      }
    }
  };

  const handleUpdate = (user: any) => {
    setSelectedUserId(user.id);
    setIsUpdate(true);
    formik.setValues({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      password: '',
      role_type: user.role_type || 'Admin',
    });
    setFormOpen(true);
  };

  const handleView = async (userId: string) => {
    try {
      const data = await callApi('get', `http://127.0.0.1:5000/users/${userId}`, null, {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      });
      setViewUser(data);
      setShowViewModal(true);
    } catch (error: any) {
      MySwal.fire('Error', error?.response?.data?.detail || 'Failed to load user data', 'error');
    }
  };

  if (isLoading) return <p>Loading users...</p>;
  if (isError) return <p>Failed to load users.</p>;


  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded shadow">
        {/* Top Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">User Management</h2>
          <button
            onClick={() => {
              setFormOpen(true);
              setIsUpdate(false);
              setSelectedUserId('');
              formik.resetForm();
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create User
          </button>
        </div>

    
        {/* View Modal */}
{showViewModal && viewUser && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative space-y-3">
      <h3 className="text-xl font-semibold mb-4">👤 User Details</h3>

      <div className="flex">
        <span className="font-bold w-28 shrink-0">First Name:</span>
        <span>{viewUser.first_name}</span>
      </div>

      <div className="flex">
        <span className="font-bold w-28">Last Name:</span>
        <span>{viewUser.last_name}</span>
      </div>

      <div className="flex">
        <span className="font-bold w-28">Email:</span>
        <span>{viewUser.email}</span>
      </div>

      <div className="flex">
        <span className="font-bold w-28">Role:</span>
        <span>{viewUser.role_id}</span>
      </div>

      <button
        onClick={() => setShowViewModal(false)}
        className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
      >
        ✖
      </button>
    </div>
  </div>
)}

        {/* Form Modal */}
        {formOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg relative">
              <h3 className="text-xl font-semibold mb-4">{isUpdate ? 'Update User' : 'Create User'}</h3>
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formik.values.first_name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full border px-3 py-2 rounded"
                    />
                    {formik.touched.first_name && formik.errors.first_name && (
                      <span className="text-sm text-red-500">{formik.errors.first_name}</span>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formik.values.last_name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full border px-3 py-2 rounded"
                    />
                    {formik.touched.last_name && formik.errors.last_name && (
                      <span className="text-sm text-red-500">{formik.errors.last_name}</span>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full border px-3 py-2 rounded"
                    />
                    {formik.touched.email && formik.errors.email && (
                      <span className="text-sm text-red-500">{formik.errors.email}</span>
                    )}
                  </div>
                  {!isUpdate && (
                    <div>
                      <label className="block mb-1">Password</label>
                      <input
                        type="password"
                        name="password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full border px-3 py-2 rounded"
                      />
                      {formik.touched.password && formik.errors.password && (
                        <span className="text-sm text-red-500">{formik.errors.password}</span>
                      )}
                    </div>
                  )}
                  <div className="col-span-2">
                    <label className="block mb-1">Role Type</label>
                    <select
                      name="role_type"
                      value={formik.values.role_type}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full border px-3 py-2 rounded"
                    >
                      <option value="Admin">Admin</option>
                      <option value="HR">HR</option>
                      <option value="Employee">Employee</option>
                    </select>
                    {formik.touched.role_type && formik.errors.role_type && (
                      <span className="text-sm text-red-500">{formik.errors.role_type}</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <button type="button" onClick={() => setFormOpen(false)} className="bg-gray-300 px-4 py-2 rounded">
                    Cancel
                  </button>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    {isUpdate ? 'Update User' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* User Table */}
         <div>
      <h3 className="text-xl font-semibold mb-4">All Users</h3>
      <Table
        columns={columns}
        data={users}
        actions={(user) => (
          <ActionButtons
            onView={() => handleView(user.id)}
            onUpdate={() => handleUpdate(user)}
            onDelete={() => handleDelete(user.id)}
          />
        )}
      />
    </div>
      </div>
    </div>
  );
}
