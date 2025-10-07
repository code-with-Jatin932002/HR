'use client';
import { useQuery, useQueryClient, QueryFunction } from '@tanstack/react-query';
import { useState, useMemo, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FiSearch, FiX } from 'react-icons/fi';
// Import required icons for the input field (FaLock is not needed for a text input, but I'll add a relevant one like FaBuilding)
import { FaBuilding } from 'react-icons/fa';


import callApi from '@/utils/callApi';
import useAuthRedirect from '@/hooks/useAuthRedirect';
import useProtectRoute from '@/hooks/useProtectRoute';
import Table from '@/components/Table';
import ActionButtons from '@/components/ActionButtons';
import Loader from '@/components/Loader';
import Button from '@/components/Button';
import Pagination from '@/components/Pagination';

// Define interfaces for type safety
interface Department {
  id: string;
  department_name: string;
}

interface ApiResponse {
  departments: Department[];
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
  { label: 'Department Name', key: 'department_name' },
];

// fetchDepartments will now explicitly take page, limit, and search query
const fetchDepartments: QueryFunction<
  ApiResponse,
  ['departments', number, number, string]
> = async ({ queryKey }) => {
  const [_key, currentPage, itemsPerPage, searchQuery] = queryKey;
  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found.');
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;

  let url = `${normalizedBaseUrl}department?page=${currentPage}&limit=${itemsPerPage}`;
  if (searchQuery) {
    url += `&search=${encodeURIComponent(searchQuery)}`;
  }

  try {
    const response = await callApi('get', url, null, {
      Authorization: `Bearer ${token}`,
    });
    return response as ApiResponse;
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};

export default function DepartmentsPage() {
  useAuthRedirect();
  useProtectRoute();

  const queryClient = useQueryClient();

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve user role from session storage
    // It's good practice to normalize the case, especially if it might be stored inconsistently.
    const role = sessionStorage.getItem('role_type')?.toLowerCase() || null;
    setUserRole(role);
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError, refetch } = useQuery<ApiResponse, Error, ApiResponse, ['departments', number, number, string]>({
    queryKey: ['departments', currentPage, itemsPerPage, searchQuery],
    queryFn: fetchDepartments,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const departments = data?.departments || [];
  const totalItems = data?.totalItems || 0;
  const totalPages = data?.totalPages || 1;

  const [formOpen, setFormOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [deletingDeptId, setDeletingDeptId] = useState<string | null>(null);

  const validationSchema = useMemo(() => {
    return Yup.object({
      department_name: Yup.string()
        .trim('Department name cannot include leading or trailing spaces')
        .required('Department name is required')
        .test(
          'not-only-whitespace',
          'Department name cannot be only spaces',
          // This explicit check solves the TypeScript error and validates for non-space content
          (value) => typeof value === 'string' && value.trim().length > 0
        ),
    });
  }, []);

  const formik = useFormik({
    initialValues: {
      department_name: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmittingForm(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
      const url = isUpdate ? `${normalizedBaseUrl}department/${selectedDeptId}` : `${normalizedBaseUrl}department`;
      const method = isUpdate ? 'put' : 'post';


      //  FIX: Trim the value before sending to the API.
      const payload = {
        department_name: values.department_name.trim(),
      };


      try {
        await callApi(method, url, payload, {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        });

        toast.success(`Department ${isUpdate ? 'updated' : 'created'} successfully!`);

        queryClient.invalidateQueries({ queryKey: ['departments'] });
        setCurrentPage(1);

        setFormOpen(false);
        setIsUpdate(false);
        setSelectedDeptId('');
        resetForm();
      } catch (error: unknown) {
        const apiError = error as ApiResponseError;
        toast.error(apiError?.response?.data?.detail || 'Something went wrong');
      } finally {
        setIsSubmittingForm(false);
      }
    },
  });

  const handleUpdate = (dept: Department) => {
    setSelectedDeptId(dept.id);
    setIsUpdate(true);
    formik.setValues({
      department_name: dept.department_name,
    });
    setFormOpen(true);
  };

  const handleDelete = async (deptId: string) => {
    setDeletingDeptId(deptId);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
      await callApi('delete', `${normalizedBaseUrl}department/${deptId}`, null, {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      });

      toast.success('Department has been deleted.');
      queryClient.invalidateQueries({ queryKey: ['departments'] });

      if (departments.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (error: unknown) {
      const apiError = error as ApiResponseError;
      toast.error(apiError?.response?.data?.detail || 'Failed to delete department');
    } finally {
      setDeletingDeptId(null);
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
        <p>Failed to load departments. Please try again.</p>
        <Button onClick={() => refetch()} label="Retry" variant="primary" className="mt-4" />
      </div>
    );
  }

  // Determine if the current user is a super_admin
  const isSuperAdmin = userRole === 'super_admin';
  
  if(formOpen){
    return(
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mt-10 w-full rounded bg-white p-6 shadow">
          {isSubmittingForm && (
            <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-white bg-opacity-80">
              <Loader />
            </div>
          )}
          <h3 className="mb-4 text-xl font-semibold text-gray-700">
            {isUpdate ? 'Update Department' : 'Create Department'}
          </h3>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* START: Input Field Change Block */}
            <div className="mb-4">
              {/* Label Style matching the desired look */}
              <label htmlFor="department_name" className="mb-2.5 block text-sm font-medium text-black">
                Department Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="department_name"
                  name="department_name"
                  placeholder="Enter department name"
                  value={formik.values.department_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  // Input Field Class updated: full-width, fixed centered text, and styled like the example
                  // text-left is the default, but we ensure no 'text-center' is overriding it.
                  // 'pr-12' is used to make space for the icon.
                  className={`
                    w-full rounded-lg border py-4 pl-6 pr-12 text-black outline-none transition duration-300
                    ${
                      formik.touched.department_name && formik.errors.department_name ? 'border-red-500' : 'border-gray-300'
                    }
                    focus:border-purple-600
                  `}
                  disabled={isSubmittingForm}
                />
                {/* Icon positioned to the right of the input, inside the relative container */}
                <FaBuilding className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              {/* Error message block remains the same, ensuring it's below the input */}
              {formik.touched.department_name && formik.errors.department_name && (
                <span className="mt-1 block text-sm text-red-500">
                  {formik.errors.department_name}
                </span>
              )}
            </div>
            {/* END: Input Field Change Block */}

            {/* Button Block: Updated to justify-end (right side) */}
            <div className="flex justify-end gap-4">
              <Button
                label="Cancel"
                type="button"
                onClick={() => {
                  setFormOpen(false);
                  setIsUpdate(false);
                  setSelectedDeptId('');
                  formik.resetForm();
                }}
                variant="secondary"
                disabled={isSubmittingForm}
              />
              <Button
                label={isUpdate ? 'Update' : 'Create'}
                type="submit"
                variant="primary"
                disabled={isSubmittingForm}
              />
            </div>
          </form>
        </div>
      </div>
    );
  }
    
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto mt-10 max-w-290 rounded bg-white p-6 shadow">
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-700 sm:text-left">Department Management</h2>
          {isSuperAdmin && (
            <Button
              label="Create Department"
              onClick={() => {
                setFormOpen(true);
                setIsUpdate(false);
                setSelectedDeptId('');
                formik.resetForm();
              }}
              variant="primary"
              disabled={isSubmittingForm}
              className="w-full sm:w-auto px-4 py-2"
            />
          )}
        </div>

        {/* Search Box for Departments */}
        <div className="w-full px-4 py-3">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700">
              <FiSearch />
            </span>
            <input
              type="text"
              placeholder="Search by department name..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full rounded-md border px-4 py-3 pl-10 pr-10 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-300 text-gray-700"
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
        <div>
          {/* <h3 className="mb-4 text-xl font-semibold">All Departments</h3> */}
          <Table
            columns={columns}
            data={departments}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            actions={(dept: Department) => (
              <div className="relative">
                {/* ActionButtons are visible for ALL roles now */}
                <ActionButtons
                  onUpdate={() => handleUpdate(dept)}
                  onDelete={() => handleDelete(dept.id)}
                  showView={false}
                />
                {deletingDeptId === dept.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-md">
                    <Loader />
                  </div>
                )}
              </div>
            )}
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
    </div>
  );
}