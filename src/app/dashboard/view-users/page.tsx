// view-users.tsx
'use client';

import { useQuery, QueryFunction } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiSearch, FiX } from 'react-icons/fi';

import Loader from '@/components/Loader'; // Import your custom Loader
import useAuthRedirect from '@/hooks/useAuthRedirect';
import useProtectRoute from '@/hooks/useProtectRoute';
import callApi from '@/utils/callApi';
import Table from '@/components/Table';
import ActionButtons from '@/components/ActionButtons';
import UserForm from '@/components/UserForm';
import Pagination from '@/components/Pagination';
import { useAuth } from '@/context/AuthContext';

// Define interfaces for type safety
interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role_type: string;
  department_name: string;
}

interface ApiResponse {
  users: User[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

interface ApiResponseError {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

const columns = [
  { label: 'Name', key: 'full_name' },
  { label: 'Email', key: 'email' },
  { label: 'Role Type', key: 'role_type' },
  { label: 'Department', key: 'department_name', responsive: 'hidden sm:table-cell' },
];

const fetchUsers: QueryFunction<
  ApiResponse,
  ['users', number, number, string]
> = async ({ queryKey }) => {
  const [_key, currentPage, itemsPerPage, searchQuery] = queryKey;
  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found.');
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;

  let url = `${normalizedBaseUrl}users?page=${currentPage}&limit=${itemsPerPage}`;
  if (searchQuery) {
    url += `&search=${encodeURIComponent(searchQuery)}`;
  }

  try {
    const response = await callApi('get', url, null, {
      Authorization: `Bearer ${token}`,
    });
    return response as ApiResponse;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export default function ViewUsersPage() {
  useAuthRedirect();
  useProtectRoute();

  const { loading, user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  // Consolidate updating and deleting into one state for blocking
  const [isBlockingOperations, setIsBlockingOperations] = useState(false); // Unified state for blocking UI

  const { data, isLoading, isError, refetch } = useQuery<ApiResponse, Error, ApiResponse, ['users', number, number, string]>({
    queryKey: ['users', currentPage, itemsPerPage, searchQuery],
    queryFn: fetchUsers,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const users = data?.users || [];
  const totalItems = data?.totalItems || 0;
  const totalPages = data?.totalPages || 1;

  const transformedUsers = users.map((user: User) => ({
    ...user,
    full_name: `${user.first_name} ${user.last_name}`,
  }));

  const [viewUser, setViewUser] = useState<User | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [updateUser, setUpdateUser] = useState<User | null>(null);

  const handleView = async (userId: string) => {
    setIsBlockingOperations(true); // Start blocking for view operation
    const loadingToastId = toast.loading('Loading user details...'); // Default style, no spinner visible
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
      const userData = await callApi('get', `${normalizedBaseUrl}users/${userId}`, null, {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      });
      setViewUser(userData);
      setShowViewModal(true);
      toast.dismiss(loadingToastId);
    } catch (error: unknown) {
      toast.dismiss(loadingToastId);
      const apiError = error as ApiResponseError;
      toast.error(apiError?.response?.data?.detail || 'Failed to load user data'); // Default style
    } finally {
      setIsBlockingOperations(false); // End blocking
    }
  };

  const handleUpdateSubmit = async (values: any) => {
    if (!updateUser) return;

    setIsBlockingOperations(true); // Start blocking for update operation
    const loadingToastId = toast.loading('Updating user...'); // Default style, no spinner visible

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;

      const payload: any = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        role_type: values.role_type,
      };

      if ((values.role_type || '').toLowerCase() !== 'admin' && (values.role_type || '').toLowerCase() !== 'super_admin') {
        payload.department_name = values.department_name;
      } else {
        payload.department_name = null;
      }

      await callApi(
        'put',
        `${normalizedBaseUrl}users/${updateUser.id}`,
        payload,
        {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      );
      toast.success('User updated successfully!', { id: loadingToastId }); // Default style
      refetch();
      setUpdateUser(null);
    } catch (error: unknown) {
      toast.dismiss(loadingToastId);
      const apiError = error as ApiResponseError;
      toast.error(apiError?.response?.data?.detail || 'Failed to update user'); // Default style
    } finally {
      setIsBlockingOperations(false); // End blocking
    }
  };

  const handleDelete = async (userId: string) => {
    setIsBlockingOperations(true); // Start blocking for delete operation
    const loadingToastId = toast.loading('Deleting user...'); // Default style, no spinner visible

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
      await callApi(
        'delete',
        `${normalizedBaseUrl}users/${userId}`,
        null,
        {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      );

      toast.success('User has been deleted.', { id: loadingToastId }); // Default style
      refetch();
      if (transformedUsers.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    } catch (error: unknown) {
      toast.dismiss(loadingToastId);
      const apiError = error as ApiResponseError;
      toast.error(apiError?.response?.data?.detail || 'Failed to delete user'); // Default style
    } finally {
      setIsBlockingOperations(false); // End blocking
    }
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Main page loader
  if (loading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader /> {/* Your custom Loader for main page load */}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-red-500">
        <p>Failed to load users. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto mt-10 w-full overflow-x-auto rounded bg-white p-6 shadow">
        <h2 className="mb-6 text-2xl font-bold">All Users</h2>

        {/* Apply blocking overlay to the entire main content area when operations are ongoing */}
        <div className="relative">
          {isBlockingOperations && (
            <div className="absolute inset-0 z-40 flex items-center justify-center rounded-lg bg-white bg-opacity-80">
              <Loader /> {/* Your custom Loader for blocking the main content */}
            </div>
          )}

          {/* Search Box for Users */}
          <div className="w-full px-4 py-3">
            <div className="relative w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-500">
                <FiSearch />
              </span>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full rounded-md border px-4 py-3 pl-10 pr-10 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
                disabled={isBlockingOperations} // Disable search during blocking operations
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-red-500"
                  disabled={isBlockingOperations} // Disable clear during blocking operations
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>

          <Table
            columns={columns}
            data={transformedUsers}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            actions={(user: User) => (
              <ActionButtons
                onView={() => handleView(user.id)}
                onUpdate={() => setUpdateUser(user)}
                onDelete={() => handleDelete(user.id)}
              />
            )}
          />

          <div className="mt-4 flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">
                {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(currentPage * itemsPerPage, totalItems)}
              </span>{' '}
              of <span className="font-medium">{totalItems}</span> results
            </p>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        </div>

        {/* View User Modal */}
        {showViewModal && viewUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            {/* Apply specific loader for the modal if a modal operation is blocking */}
            <div className="relative w-full max-w-md space-y-3 rounded-lg bg-white p-6 shadow-lg">
              {/* No specific loader needed inside view modal, as isBlockingOperations covers the whole page */}
              <h3 className="mb-4 text-xl font-semibold">👤 User Details</h3>
              <div className="flex">
                <span className="w-28 font-bold">Name:</span>
                <span>{`${viewUser.first_name} ${viewUser.last_name}`}</span>
              </div>
              <div className="flex">
                <span className="w-28 font-bold">Email:</span>
                <span>{viewUser.email}</span>
              </div>
              <div className="flex">
                <span className="w-28 font-bold">Role:</span>
                <span>{viewUser.role_type}</span>
              </div>
              {(viewUser.role_type || '').toLowerCase() !== 'admin' &&
                (viewUser.role_type || '').toLowerCase() !== 'super_admin' && (
                  <div className="flex">
                    <span className="w-28 font-bold">Department:</span>
                    <span>{viewUser.department_name || 'N/A'}</span>
                  </div>
                )}

              <button
                onClick={() => setShowViewModal(false)}
                className="absolute right-2 top-2 text-xl text-gray-500 hover:text-black"
                disabled={isBlockingOperations}
              >
                ✖
              </button>
            </div>
          </div>
        )}

        {/* Update User Modal */}
        {updateUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-lg bg-white p-6">
              {isBlockingOperations && (
                <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-white bg-opacity-80">
                  <Loader /> {/* Your custom Loader for the update modal */}
                </div>
              )}
              <h3 className="mb-4 text-xl font-semibold">Update User</h3>
              <UserForm
                isUpdate={true}
                initialValues={{
                  first_name: updateUser.first_name,
                  last_name: updateUser.last_name,
                  email: updateUser.email,
                  password: '',
                  role_type: updateUser.role_type || '',
                  department_name: updateUser.department_name || '',
                }}
                onCancel={() => setUpdateUser(null)}
                onSubmit={handleUpdateSubmit}
                currentUserRole={user?.role_type || ''}
                isSubmitting={isBlockingOperations} // Pass the loading state to disable fields
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}