
'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import useAuthRedirect from '@/hooks/useAuthRedirect';
import useProtectRoute from '@/hooks/useProtectRoute';
import callApi from '@/utils/callApi';
import Table from '@/components/Table';
import ActionButtons from '@/components/ActionButtons';
import UserForm from '@/components/UserForm';

import { useAuth } from '@/context/AuthContext'; // Import useAuth to get logged-in user's role

const MySwal = withReactContent(Swal);

const columns = [
  { label: 'Name', key: 'full_name' },
  { label: 'Email', key: 'email' },
  //  { label: 'Role ID', key: 'role_id' }, // Added Role Type to table for visibility
];

const fetchUsers = async () => {
  const token = localStorage.getItem('token');
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  return await callApi('get', `${baseUrl}/users`, null, {
    Authorization: `Bearer ${token}`,
  });
};

export default function ViewUsersPage() {
  useAuthRedirect();
  useProtectRoute();
  const { loading, user } = useAuth(); // Get user object from AuthContext
  if (loading) return null;

  const { data: users = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  // Transform user data to include 'full_name'
  const transformedUsers = users.map((user: any) => ({
    ...user,
    full_name: `${user.first_name} ${user.last_name}`,
  }));

  const [viewUser, setViewUser] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  const [updateUser, setUpdateUser] = useState<any>(null);

  const handleView = async (userId: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const data = await callApi('get', `${baseUrl}/users/${userId}`, null, {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      });
      setViewUser(data);
      setShowViewModal(true);
    } catch (error: any) {
      MySwal.fire('Error', error?.response?.data?.detail || 'Failed to load user data', 'error');
    }
  };

  const handleUpdateSubmit = async (values: any) => {
    try {
      // You may need to adapt this part based on how your API handles role_type updates.
      // The current API call only sends first_name and last_name.
      // If role_type also needs to be sent, include it in the payload.
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      await callApi(
        'put',
        `${baseUrl}/users/${updateUser.id}?email=${encodeURIComponent(values.email)}`,
        {
          user_id: updateUser.id,
          first_name: values.first_name,
          last_name: values.last_name,
          role_type: values.role_type, // IMPORTANT: Include role_type here if your API supports it
          department_name: values.department_name, // IMPORTANT: Include department_name if your API supports it
        },
        {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      );
      MySwal.fire('Updated', 'User updated successfully!', 'success');
      refetch();
      setUpdateUser(null);
    } catch (error: any) {
      MySwal.fire('Error', error?.response?.data?.detail || 'Failed to update user', 'error');
    }
  };

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
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        await callApi('delete', `${baseUrl}/users/${userId}`, { user_id: userId }, {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        });

        MySwal.fire('Deleted!', 'User has been deleted.', 'success');
        refetch();
      } catch (error: any) {
        MySwal.fire('Error', error?.response?.data?.detail || 'Failed to delete user', 'error');
      }
    }
  };

  if (isLoading) return <p>Loading users...</p>;
  if (isError) return <p>Failed to load users.</p>;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6">All Users</h2>

        <Table
          columns={columns}
          data={transformedUsers}
          actions={(user) => (
            <ActionButtons
              onView={() => handleView(user.id)}
              onUpdate={() => setUpdateUser(user)}
              onDelete={() => handleDelete(user.id)}
            />
          )}
          itemsPerPage={10}
        />

        {/* View Modal */}
        {showViewModal && viewUser && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative space-y-3">
              <h3 className="text-xl font-semibold mb-4">👤 User Details</h3>
              <div className="flex"><span className="font-bold w-28">Name:</span><span>{`${viewUser.first_name} ${viewUser.last_name}`}</span></div>
              <div className="flex"><span className="font-bold w-28">Email:</span><span>{viewUser.email}</span></div>
              {/* <div className="flex"><span className="font-bold w-28">Role:</span><span>{viewUser.role_type}</span></div> 
              <div className="flex"><span className="font-bold w-28">Department:</span><span>{viewUser.department_name}</span></div> Display department */}


              <button
                onClick={() => setShowViewModal(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
              >
                ✖
              </button>
            </div>
          </div>
        )}

        {/* Update Modal */}
        {updateUser && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg relative">
              <h3 className="text-xl font-semibold mb-4">Update User</h3>
              <UserForm
                isUpdate={true}
                initialValues={{
                  first_name: updateUser.first_name,
                  last_name: updateUser.last_name,
                  email: updateUser.email,
                  password: '', // Password field is not shown/updated in 'isUpdate' mode
                  role_type: updateUser.role_type || '', // Use existing role_type for initial value
                  department_name: updateUser.department_name || '', // Use existing department_name
                }}
                onCancel={() => setUpdateUser(null)}
                onSubmit={handleUpdateSubmit}
                currentUserRole={user?.role_type || ''} // <--- FIX: Pass the logged-in user's role here
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}