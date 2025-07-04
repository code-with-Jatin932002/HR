// 'use client';

// import { useQuery, QueryFunction } from '@tanstack/react-query';
// import { useState, useCallback } from 'react';
// import Swal from 'sweetalert2';
// import withReactContent from 'sweetalert2-react-content';
// import { FiSearch, FiX } from 'react-icons/fi'; // Import search icons

// import Loader from '@/components/Loader';
// import useAuthRedirect from '@/hooks/useAuthRedirect';
// import useProtectRoute from '@/hooks/useProtectRoute';
// import callApi from '@/utils/callApi';
// import Table from '@/components/Table'; // Ensure Table.tsx is updated as well
// import ActionButtons from '@/components/ActionButtons';
// import UserForm from '@/components/UserForm';
// import Pagination from '@/components/Pagination';
// import { useAuth } from '@/context/AuthContext';

// const MySwal = withReactContent(Swal);

// // Define interfaces for type safety
// interface User {
//   id: string;
//   first_name: string;
//   last_name: string;
//   email: string;
//   role_type: string;
//   department_name: string;
// }

// interface ApiResponse {
//   users: User[];
//   totalItems: number;
//   totalPages: number;
//   currentPage: number;
//   pageSize: number;
// }

// interface ApiResponseError {
//   response?: {
//     data?: {
//       detail?: string;
//     };
//   };
// }

// // Responsive column configuration (optional)
// const columns = [
//   { label: 'Name', key: 'full_name' },
//   { label: 'Email', key: 'email' },
//   { label: 'Role Type', key: 'role_type' },
//   { label: 'Department', key: 'department_name', responsive: 'hidden sm:table-cell' },
// ];

// const fetchUsers: QueryFunction<
//   ApiResponse, // TQueryFnData: The type of data this function returns
//   ['users', number, number, string] // TQueryKey: The exact shape of the queryKey, now including search
// > = async ({ queryKey }) => {
//   const [_key, currentPage, itemsPerPage, searchQuery] = queryKey;
//   const token = sessionStorage.getItem('token');

//   if (!token) {
//     throw new Error('No authentication token found.');
//   }
//   const baseUrl = process.env.NEXT_PUBLIC_API_URL;
//   // Ensure the base URL has a trailing slash for consistent URL construction
//   const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;

//   let url = `${normalizedBaseUrl}users?page=${currentPage}&limit=${itemsPerPage}`;
//   if (searchQuery) {
//     url += `&search=${encodeURIComponent(searchQuery)}`;
//   }

//   try {
//     const response = await callApi('get', url, null, {
//       Authorization: `Bearer ${token}`,
//     });
//     return response as ApiResponse; // Cast to ApiResponse for type safety
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     throw error;
//   }
// };

// export default function ViewUsersPage() {
//   useAuthRedirect();
//   useProtectRoute();

//   const { loading, user } = useAuth();
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);
//   const [searchQuery, setSearchQuery] = useState(''); // New state for search query

//   const { data, isLoading, isError, refetch } = useQuery<ApiResponse, Error, ApiResponse, ['users', number, number, string]>({
//     queryKey: ['users', currentPage, itemsPerPage, searchQuery], // Include searchQuery in the queryKey
//     queryFn: fetchUsers,
//     placeholderData: (previousData) => previousData,
//     refetchOnWindowFocus: false, // Prevents automatic refetch on window focus
//     staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
//   });

//   const users = data?.users || [];
//   const totalItems = data?.totalItems || 0;
//   const totalPages = data?.totalPages || 1;

//   const transformedUsers = users.map((user: User) => ({ // Explicitly type user as User
//     ...user,
//     full_name: `${user.first_name} ${user.last_name}`,
//   }));

//   const [viewUser, setViewUser] = useState<User | null>(null); // Type viewUser as User or null
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [updateUser, setUpdateUser] = useState<User | null>(null); // Type updateUser as User or null

//   const handleView = async (userId: string) => {
//     try {
//       const baseUrl = process.env.NEXT_PUBLIC_API_URL;
//       const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
//       const userData = await callApi('get', `${normalizedBaseUrl}users/${userId}`, null, {
//         Authorization: `Bearer ${sessionStorage.getItem('token')}`,
//       });
//       setViewUser(userData);
//       setShowViewModal(true);
//     } catch (error: unknown) { // Catch unknown error and cast
//       const apiError = error as ApiResponseError;
//       MySwal.fire('Error', apiError?.response?.data?.detail || 'Failed to load user data', 'error');
//     }
//   };

//   const handleUpdateSubmit = async (values: any) => { // UserForm values might be a bit broader
//     if (!updateUser) return; // Ensure updateUser is not null

//     try {
//       const baseUrl = process.env.NEXT_PUBLIC_API_URL;
//       const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
//       await callApi(
//         'put',
//         `${normalizedBaseUrl}users/${updateUser.id}`,
//         {
//           first_name: values.first_name,
//           last_name: values.last_name,
//           email: values.email,
//           role_type: values.role_type,
//           department_name: values.department_name,
//         },
//         {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${sessionStorage.getItem('token')}`,
//         }
//       );
//       MySwal.fire('Updated', 'User updated successfully!', 'success');
//       refetch(); // Refetch users to show updated data
//       setUpdateUser(null); // Close the update modal
//     } catch (error: unknown) {
//       const apiError = error as ApiResponseError;
//       MySwal.fire('Error', apiError?.response?.data?.detail || 'Failed to update user', 'error');
//     }
//   };

//   const handleDelete = async (userId: string) => {
//     const confirm = await MySwal.fire({
//       title: 'Are you sure?',
//       text: 'You are about to delete this user!',
//       icon: 'warning',
//       showCancelButton: true,
//       confirmButtonColor: '#d33',
//       cancelButtonColor: '#3085d6',
//       confirmButtonText: 'Yes, delete it!',
//     });

//     if (confirm.isConfirmed) {
//       try {
//         const baseUrl = process.env.NEXT_PUBLIC_API_URL;
//         const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
//         await callApi(
//           'delete',
//           `${normalizedBaseUrl}users/${userId}`,
//           null, // No body needed for DELETE if user_id is in URL
//           {
//             'Content-Type': 'application/json', // Still good practice to include
//             Authorization: `Bearer ${sessionStorage.getItem('token')}`,
//           }
//         );

//         MySwal.fire('Deleted!', 'User has been deleted.', 'success');
//         refetch(); // Refetch users to update the list
//         // Adjust currentPage if the last item on a page was deleted and it's not page 1
//         if (transformedUsers.length === 1 && currentPage > 1) {
//           setCurrentPage(prev => prev - 1);
//         }
//       } catch (error: unknown) {
//         const apiError = error as ApiResponseError;
//         MySwal.fire('Error', apiError?.response?.data?.detail || 'Failed to delete user', 'error');
//       }
//     }
//   };

//   const handlePageChange = useCallback((page: number) => {
//     setCurrentPage(page);
//   }, []);

//   /**
//    * Handles changes to the search input.
//    * @param e - The change event from the input.
//    */
//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchQuery(e.target.value);
//     setCurrentPage(1); // Reset to first page on new search
//   };

//   /**
//    * Clears the search query.
//    */
//   const clearSearch = () => {
//     setSearchQuery('');
//     setCurrentPage(1); // Reset to first page when clearing search
//   };

//   if (loading || isLoading) {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <Loader />
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="flex h-full flex-col items-center justify-center text-red-500">
//         <p>Failed to load users. Please try again.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full px-4 sm:px-6 lg:px-8">
//       <div className="mx-auto mt-10 w-full overflow-x-auto rounded bg-white p-6 shadow">
//         <h2 className="mb-6 text-2xl font-bold">All Users</h2>

//         {/* Search Box for Users */}
//         <div className="w-full px-4 py-3">
//           <div className="relative w-full">
//             <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
//               <FiSearch />
//             </span>
//             <input
//               type="text"
//               placeholder="Search by name or email..."
//               value={searchQuery}
//               onChange={handleSearchChange}
//               className="w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
//             />
//             {searchQuery && (
//               <button
//                 onClick={clearSearch}
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500"
//               >
//                 <FiX />
//               </button>
//             )}
//           </div>
//         </div>

//         <Table
//           columns={columns}
//           data={transformedUsers}
//           currentPage={currentPage} // ADDED: Pass currentPage
//           itemsPerPage={itemsPerPage} // ADDED: Pass itemsPerPage
//           actions={(user: User) => ( // Explicitly type user as User
//             <ActionButtons
//               onView={() => handleView(user.id)}
//               onUpdate={() => setUpdateUser(user)}
//               onDelete={() => handleDelete(user.id)}
//             />
//           )}
//         />

//         <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
//           <p className="text-sm text-gray-700">
//             Showing{' '}
//             <span className="font-medium">
//               {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}
//             </span>{' '}
//             to{' '}
//             <span className="font-medium">
//               {Math.min(currentPage * itemsPerPage, totalItems)}
//             </span>{' '}
//             of <span className="font-medium">{totalItems}</span> results
//           </p>
//           <Pagination
//             currentPage={currentPage}
//             totalPages={totalPages}
//             onPageChange={handlePageChange}
//           />
//         </div>

//         {/* View User Modal */}
//         {showViewModal && viewUser && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
//             <div className="relative w-full max-w-md space-y-3 rounded-lg bg-white p-6 shadow-lg">
//               <h3 className="mb-4 text-xl font-semibold">👤 User Details</h3>
//               <div className="flex">
//                 <span className="w-28 font-bold">Name:</span>
//                 <span>{`${viewUser.first_name} ${viewUser.last_name}`}</span>
//               </div>
//               <div className="flex">
//                 <span className="w-28 font-bold">Email:</span>
//                 <span>{viewUser.email}</span>
//               </div>
//               <div className="flex">
//                 <span className="w-28 font-bold">Role:</span>
//                 <span>{viewUser.role_type}</span>
//               </div>
//               <div className="flex">
//                 <span className="w-28 font-bold">Department:</span>
//                 <span>{viewUser.department_name}</span>
//               </div>

//               <button
//                 onClick={() => setShowViewModal(false)}
//                 className="absolute right-2 top-2 text-xl text-gray-500 hover:text-black"
//               >
//                 ✖
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Update User Modal */}
//         {updateUser && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
//             <div className="relative w-full max-w-lg rounded-lg bg-white p-6">
//               <h3 className="mb-4 text-xl font-semibold">Update User</h3>
//               <UserForm
//                 isUpdate={true}
//                 initialValues={{
//                   first_name: updateUser.first_name,
//                   last_name: updateUser.last_name,
//                   email: updateUser.email,
//                   password: '', // Password should ideally not be pre-filled
//                   role_type: updateUser.role_type || '',
//                   department_name: updateUser.department_name || '',
//                 }}
//                 onCancel={() => setUpdateUser(null)}
//                 onSubmit={handleUpdateSubmit}
//                 currentUserRole={user?.role_type || ''}
//               />
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




// view-users.tsx
'use client';

import { useQuery, QueryFunction } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { FiSearch, FiX } from 'react-icons/fi'; // Import search icons

import Loader from '@/components/Loader';
import useAuthRedirect from '@/hooks/useAuthRedirect';
import useProtectRoute from '@/hooks/useProtectRoute';
import callApi from '@/utils/callApi';
import Table from '@/components/Table'; // Ensure Table.tsx is updated as well
import ActionButtons from '@/components/ActionButtons';
import UserForm from '@/components/UserForm';
import Pagination from '@/components/Pagination';
import { useAuth } from '@/context/AuthContext';

const MySwal = withReactContent(Swal);

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

// Responsive column configuration (optional)
const columns = [
  { label: 'Name', key: 'full_name' },
  { label: 'Email', key: 'email' },
  { label: 'Role Type', key: 'role_type' },
  { label: 'Department', key: 'department_name', responsive: 'hidden sm:table-cell' },
];

const fetchUsers: QueryFunction<
  ApiResponse, // TQueryFnData: The type of data this function returns
  ['users', number, number, string] // TQueryKey: The exact shape of the queryKey, now including search
> = async ({ queryKey }) => {
  const [_key, currentPage, itemsPerPage, searchQuery] = queryKey;
  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found.');
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  // Ensure the base URL has a trailing slash for consistent URL construction
  const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;

  let url = `${normalizedBaseUrl}users?page=${currentPage}&limit=${itemsPerPage}`;
  if (searchQuery) {
    url += `&search=${encodeURIComponent(searchQuery)}`;
  }

  try {
    const response = await callApi('get', url, null, {
      Authorization: `Bearer ${token}`,
    });
    return response as ApiResponse; // Cast to ApiResponse for type safety
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
  const [searchQuery, setSearchQuery] = useState(''); // New state for search query

  const { data, isLoading, isError, refetch } = useQuery<ApiResponse, Error, ApiResponse, ['users', number, number, string]>({
    queryKey: ['users', currentPage, itemsPerPage, searchQuery], // Include searchQuery in the queryKey
    queryFn: fetchUsers,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false, // Prevents automatic refetch on window focus
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  });

  const users = data?.users || [];
  const totalItems = data?.totalItems || 0;
  const totalPages = data?.totalPages || 1;

  const transformedUsers = users.map((user: User) => ({ // Explicitly type user as User
    ...user,
    full_name: `${user.first_name} ${user.last_name}`,
  }));

  const [viewUser, setViewUser] = useState<User | null>(null); // Type viewUser as User or null
  const [showViewModal, setShowViewModal] = useState(false);
  const [updateUser, setUpdateUser] = useState<User | null>(null); // Type updateUser as User or null

  const handleView = async (userId: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
      const userData = await callApi('get', `${normalizedBaseUrl}users/${userId}`, null, {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      });
      setViewUser(userData);
      setShowViewModal(true);
    } catch (error: unknown) { // Catch unknown error and cast
      const apiError = error as ApiResponseError;
      MySwal.fire('Error', apiError?.response?.data?.detail || 'Failed to load user data', 'error');
    }
  };

  const handleUpdateSubmit = async (values: any) => { // UserForm values might be a bit broader
    if (!updateUser) return; // Ensure updateUser is not null

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;

      // Conditionally include department_name in the payload
      const payload: any = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        role_type: values.role_type,
      };

      if ((values.role_type || '').toLowerCase() !== 'admin' && (values.role_type || '').toLowerCase() !== 'super_admin') {
        payload.department_name = values.department_name;
      } else {
        // If the role is Admin or Super_Admin, ensure department_name is not sent or is null/empty
        payload.department_name = null; // Or undefined, or omit entirely based on backend expectation
      }

      await callApi(
        'put',
        `${normalizedBaseUrl}users/${updateUser.id}`,
        payload,
        {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        }
      );
      MySwal.fire('Updated', 'User updated successfully!', 'success');
      refetch(); // Refetch users to show updated data
      setUpdateUser(null); // Close the update modal
    } catch (error: unknown) {
      const apiError = error as ApiResponseError;
      MySwal.fire('Error', apiError?.response?.data?.detail || 'Failed to update user', 'error');
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
        const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
        await callApi(
          'delete',
          `${normalizedBaseUrl}users/${userId}`,
          null, // No body needed for DELETE if user_id is in URL
          {
            'Content-Type': 'application/json', // Still good practice to include
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          }
        );

        MySwal.fire('Deleted!', 'User has been deleted.', 'success');
        refetch(); // Refetch users to update the list
        // Adjust currentPage if the last item on a page was deleted and it's not page 1
        if (transformedUsers.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        }
      } catch (error: unknown) {
        const apiError = error as ApiResponseError;
        MySwal.fire('Error', apiError?.response?.data?.detail || 'Failed to delete user', 'error');
      }
    }
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  /**
   * Handles changes to the search input.
   * @param e - The change event from the input.
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  /**
   * Clears the search query.
   */
  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1); // Reset to first page when clearing search
  };

  if (loading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
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

        {/* Search Box for Users */}
        <div className="w-full px-4 py-3">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <FiSearch />
            </span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500"
              >
                <FiX />
              </button>
            )}
          </div>
        </div>

        <Table
          columns={columns}
          data={transformedUsers}
          currentPage={currentPage} // ADDED: Pass currentPage
          itemsPerPage={itemsPerPage} // ADDED: Pass itemsPerPage
          actions={(user: User) => ( // Explicitly type user as User
            <ActionButtons
              onView={() => handleView(user.id)}
              onUpdate={() => setUpdateUser(user)}
              onDelete={() => handleDelete(user.id)}
            />
          )}
        />

        <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>

        {/* View User Modal */}
        {showViewModal && viewUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="relative w-full max-w-md space-y-3 rounded-lg bg-white p-6 shadow-lg">
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
              {/* Conditionally display Department */}
              {(viewUser.role_type || '').toLowerCase() !== 'admin' && (viewUser.role_type || '').toLowerCase() !== 'super_admin' && (
                <div className="flex">
                  <span className="w-28 font-bold">Department:</span>
                  <span>{viewUser.department_name || 'N/A'}</span>
                </div>
              )}

              <button
                onClick={() => setShowViewModal(false)}
                className="absolute right-2 top-2 text-xl text-gray-500 hover:text-black"
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
              <h3 className="mb-4 text-xl font-semibold">Update User</h3>
              <UserForm
                isUpdate={true}
                initialValues={{
                  first_name: updateUser.first_name,
                  last_name: updateUser.last_name,
                  email: updateUser.email,
                  password: '', // Password should ideally not be pre-filled
                  role_type: updateUser.role_type || '',
                  department_name: updateUser.department_name || '',
                }}
                onCancel={() => setUpdateUser(null)}
                onSubmit={handleUpdateSubmit}
                currentUserRole={user?.role_type || ''}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}