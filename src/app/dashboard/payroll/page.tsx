'use client';
import { useQuery, useQueryClient, QueryFunction } from '@tanstack/react-query';
import { useState, useMemo, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FiSearch, FiX, FiEye } from 'react-icons/fi';

import callApi from '@/utils/callApi';
import useAuthRedirect from '@/hooks/useAuthRedirect';
import useProtectRoute from '@/hooks/useProtectRoute';
import Table from '@/components/Table';
import ActionButtons from '@/components/ActionButtons';
import Loader from '@/components/Loader';
import Button from '@/components/Button';
import Pagination from '@/components/Pagination';

// Define interfaces for type safety
interface User {
  id: string;
  first_name: string;
  last_name: string;
  full_name?: string; // Derived for UI display
  email: string; // Added from your API response
  role_type: string; // Added from your API response
  department_name: string | null; // Added from your API response
}

interface Payroll {
  id: string;
  user_id: string;
  organization_id: string;
  employee_name: string; // This is returned by the API
  ctc: string;
  salary_per_month: string;
  deduction: string;
  status: 'Pending' | 'Completed';
  created_at: string;
  updated_at: string;
}

interface PayrollApiResponse {
  payrolls: Payroll[];
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

interface ApiResponseError {
  response?: {
    data?: {
      detail?: string | object; // Detail can be a string or an object (e.g., validation errors)
      message?: string; // Sometimes APIs use 'message' instead of 'detail'
      error?: string; // Another common error field
    };
  };
}

interface PayrollFormValues {
  user_id: string;
  ctc: string;
  salary_per_month: string;
  deduction: string;
  status: 'Pending' | 'Completed';
}

const payrollColumns = [
  { label: 'Employee Name', key: 'employee_name' },
  { label: 'CTC', key: 'ctc' },
  { label: 'Salary Per Month', key: 'salary_per_month' },
  { label: 'Deduction', key: 'deduction' },
  { label: 'Status', key: 'status' },
];

const payrollStatusOptions = ['Pending', 'Completed'];

const fetchPayrolls: QueryFunction<
  PayrollApiResponse,
  ['payrolls', number, number, string, string, string]
> = async ({ queryKey }) => {
  const [_key, currentPage, itemsPerPage, searchQuery, status, userId] = queryKey;
  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found.');
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;

  let url = `${normalizedBaseUrl}payrolls?page=${currentPage}&limit=${itemsPerPage}`;
  if (searchQuery) {
    url += `&search=${encodeURIComponent(searchQuery)}`;
  }
  if (status) {
    url += `&status=${encodeURIComponent(status)}`;
  }
  if (userId) {
    url += `&user_id=${encodeURIComponent(userId)}`;
  }

  try {
    const response = await callApi('get', url, null, {
      Authorization: `Bearer ${token}`,
    });
    return response as PayrollApiResponse;
  } catch (error) {
    console.error('Error fetching payrolls:', error);
    throw error;
  }
};

const fetchUsers: QueryFunction<
  UserApiResponse,
  ['users']
> = async ({ queryKey }) => {
  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found.');
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;

  try {
    // Using limit=100 as a reasonable default for dropdown. Adjust if needed.
    const response = await callApi('get', `${normalizedBaseUrl}users?page=1&limit=100`, null, {
      Authorization: `Bearer ${token}`,
    });
    return response as UserApiResponse;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

const fetchPayrollById: QueryFunction<
  Payroll,
  ['payroll', string]
> = async ({ queryKey }) => {
  const [_key, payrollId] = queryKey;
  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found.');
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;

  try {
    const response = await callApi('get', `${normalizedBaseUrl}payrolls/${payrollId}`, null, {
      Authorization: `Bearer ${token}`,
    });
    return response as Payroll;
  } catch (error) {
    console.error(`Error fetching payroll with ID ${payrollId}:`, error);
    throw error;
  }
};

export default function PayrollsPage() {
  useAuthRedirect();
  useProtectRoute();

  const queryClient = useQueryClient();

  const [userRole, setUserRole] = useState<string | null>(null);

  // State to hold the employee name for the POST request if required by backend
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>('');

  useEffect(() => {
    const role = sessionStorage.getItem('role_type')?.toLowerCase();
    setUserRole(role || null);
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterUserId, setFilterUserId] = useState('');

  const {
    data: payrollsData,
    isLoading: isLoadingPayrolls,
    isError: isErrorPayrolls,
    refetch: refetchPayrolls,
  } = useQuery<PayrollApiResponse, Error, PayrollApiResponse, ['payrolls', number, number, string, string, string]>({
    queryKey: ['payrolls', currentPage, itemsPerPage, searchQuery, filterStatus, filterUserId],
    queryFn: fetchPayrolls,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
  } = useQuery<UserApiResponse, Error, UserApiResponse, ['users']>({
    queryKey: ['users'],
    queryFn: fetchUsers,
    refetchOnWindowFocus: false,
    staleTime: 15 * 60 * 1000,
  });

  const payrolls = payrollsData?.payrolls || [];
  const totalItems = payrollsData?.totalItems || 0;
  const totalPages = payrollsData?.totalPages || 1;

  const usersForDropdown = useMemo(() => {
    return (usersData?.users || []).map(user => ({
      ...user,
      full_name: `${user.first_name} ${user.last_name}`.trim(),
    }));
  }, [usersData]);

  const [formOpen, setFormOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedPayrollId, setSelectedPayrollId] = useState('');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [deletingPayrollId, setDeletingPayrollId] = useState<string | null>(null);
  const [viewingPayrollId, setViewingPayrollId] = useState<string | null>(null);

  const {
    data: viewingPayrollDetails,
    isLoading: isLoadingViewingPayroll,
    isError: isErrorViewingPayroll,
  } = useQuery<Payroll, Error, Payroll, ['payroll', string]>({
    queryKey: ['payroll', viewingPayrollId!],
    queryFn: fetchPayrollById,
    enabled: !!viewingPayrollId,
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  const validationSchema = useMemo(() => {
    return Yup.object({
      user_id: Yup.string().required('Employee is required'),
      ctc: Yup.number()
        .required('CTC is required')
        .typeError('CTC must be a number')
        .min(0.01, 'CTC must be greater than zero'),
      salary_per_month: Yup.number()
        .required('Salary per month is required')
        .typeError('Salary must be a number')
        .min(0.01, 'Salary must be greater than zero'),
      deduction: Yup.number()
        .required('Deduction is required')
        .typeError('Deduction must be a number')
        .min(0, 'Deduction cannot be negative'),
      status: Yup.string().oneOf(payrollStatusOptions, 'Invalid status').optional(),
    });
  }, []);

  const formik = useFormik<PayrollFormValues>({
    initialValues: {
      user_id: '',
      ctc: '',
      salary_per_month: '',
      deduction: '',
      status: 'Pending',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmittingForm(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
      const url = isUpdate ? `${normalizedBaseUrl}payrolls/${selectedPayrollId}` : `${normalizedBaseUrl}payrolls`;
      const method = isUpdate ? 'put' : 'post';

      let payload: any;

      if (isUpdate) {
        payload = {
          ctc: parseFloat(values.ctc),
          salary_per_month: parseFloat(values.salary_per_month),
          deduction: parseFloat(values.deduction),
          status: values.status,
        };
      } else {
        payload = {
          user_id: values.user_id,
          ctc: parseFloat(values.ctc),
          salary_per_month: parseFloat(values.salary_per_month),
          deduction: parseFloat(values.deduction),
          employee_name: selectedEmployeeName, // Add employee_name here if backend POST requires it
        };
      }

      try {
        await callApi(method, url, payload, {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        });

        toast.success(`Payroll ${isUpdate ? 'updated' : 'created'} successfully!`);

        queryClient.invalidateQueries({ queryKey: ['payrolls'] });
        setCurrentPage(1);

        setFormOpen(false);
        setIsUpdate(false);
        setSelectedPayrollId('');
        resetForm();
        setSelectedEmployeeName(''); // Reset selected employee name
      } catch (error: unknown) {
        const apiError = error as ApiResponseError;
        let errorMessage = 'Something went wrong';

        // Enhanced error handling for toast
        if (apiError?.response?.data?.detail) {
          if (typeof apiError.response.data.detail === 'string') {
            errorMessage = apiError.response.data.detail;
          } else if (typeof apiError.response.data.detail === 'object') {
            // If 'detail' is an object, try to stringify or get a specific message
            try {
              errorMessage = JSON.stringify(apiError.response.data.detail);
            } catch (e) {
              errorMessage = "Validation error: Could not parse details.";
            }
          }
        } else if (apiError?.response?.data?.message) {
            errorMessage = apiError.response.data.message;
        } else if (apiError?.response?.data?.error) {
            errorMessage = apiError.response.data.error;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        toast.error(errorMessage);
      } finally {
        setIsSubmittingForm(false);
      }
    },
  });

  const handleUpdate = (payroll: Payroll) => {
    setSelectedPayrollId(payroll.id);
    setIsUpdate(true);
    formik.setValues({
      user_id: payroll.user_id, // Pre-fill, but disabled in form if isUpdate
      ctc: payroll.ctc,
      salary_per_month: payroll.salary_per_month,
      deduction: payroll.deduction,
      status: payroll.status,
    });
    // For update, employee_name is already in payroll object for display
    setSelectedEmployeeName(payroll.employee_name);
    setFormOpen(true);
  };

  const handleDelete = async (payrollId: string) => {
    setDeletingPayrollId(payrollId);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
      await callApi('delete', `${normalizedBaseUrl}payrolls/${payrollId}`, null, {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      });

      toast.success('Payroll has been deleted.');
      queryClient.invalidateQueries({ queryKey: ['payrolls'] });

      if (payrolls.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    } catch (error: unknown) {
      const apiError = error as ApiResponseError;
      toast.error(apiError?.response?.data?.detail?.toString() || 'Failed to delete payroll');
    } finally {
      setDeletingPayrollId(null);
    }
  };

  const handleView = (payrollId: string) => {
    setViewingPayrollId(payrollId);
  };

  const handleCloseView = () => {
    setViewingPayrollId(null);
    queryClient.removeQueries({ queryKey: ['payroll', viewingPayrollId!] });
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

  const handleEmployeeSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    formik.setFieldValue('user_id', userId);

    // Find the selected user's full_name
    const selectedUser = usersForDropdown.find(user => user.id === userId);
    if (selectedUser) {
      setSelectedEmployeeName(selectedUser.full_name || '');
    } else {
      setSelectedEmployeeName('');
    }
  };

  if (isLoadingPayrolls || isLoadingUsers) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isErrorPayrolls) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-red-500">
        <p>Failed to load payrolls. Please try again.</p>
        <Button onClick={() => refetchPayrolls()} label="Retry" variant="primary" className="mt-4" />
      </div>
    );
  }

  const allowedRolesForAddPayroll = ['super_admin', 'admin', 'hr', 'manager'];
  const canAddPayroll = userRole ? allowedRolesForAddPayroll.includes(userRole) : false;

        {/* Payroll Form Modal */}
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
                {isUpdate ? 'Update Payroll' : 'Create Payroll'}
              </h3>
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                  <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                {!isUpdate && ( // Only show user selection for new payrolls
                  <div>
                    <label htmlFor="user_id" className="mb-1 block text-sm font-medium text-gray-700">Employee</label>
                    <select
                      id="user_id"
                      name="user_id"
                      value={formik.values.user_id}
                      onChange={handleEmployeeSelectChange} // Use new handler
                      onBlur={formik.handleBlur}
                      className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
                      disabled={isSubmittingForm || isLoadingUsers}
                    >
                      <option value="">Select an employee</option>
                      {usersForDropdown.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.full_name}
                        </option>
                      ))}
                    </select>
                    {formik.touched.user_id && formik.errors.user_id && (
                      <span className="text-sm text-red-500">{formik.errors.user_id}</span>
                    )}
                  </div>
                )}
                <div>
                  <label htmlFor="ctc" className="mb-1 block text-sm font-medium text-gray-700">CTC</label>
                  <input
                    type="number"
                    id="ctc"
                    name="ctc"
                    placeholder="Enter CTC"
                    value={formik.values.ctc}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
                    disabled={isSubmittingForm}
                  />
                  {formik.touched.ctc && formik.errors.ctc && (
                    <span className="text-sm text-red-500">{formik.errors.ctc}</span>
                  )}
                </div>
                <div>
                  <label htmlFor="salary_per_month" className="mb-1 block text-sm font-medium text-gray-700">Salary Per Month</label>
                  <input
                    type="number"
                    id="salary_per_month"
                    name="salary_per_month"
                    placeholder="Enter salary per month"
                    value={formik.values.salary_per_month}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
                    disabled={isSubmittingForm}
                  />
                  {formik.touched.salary_per_month && formik.errors.salary_per_month && (
                    <span className="text-sm text-red-500">{formik.errors.salary_per_month}</span>
                  )}
                </div>
                <div>
                  <label htmlFor="deduction" className="mb-1 block text-sm font-medium text-gray-700">Deduction</label>
                  <input
                    type="number"
                    id="deduction"
                    name="deduction"
                    placeholder="Enter deduction"
                    value={formik.values.deduction}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
                    disabled={isSubmittingForm}
                  />
                  {formik.touched.deduction && formik.errors.deduction && (
                    <span className="text-sm text-red-500">{formik.errors.deduction}</span>
                  )}
                </div>
                {isUpdate && ( // Only show status for updates
                  <div>
                    <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formik.values.status}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
                      disabled={isSubmittingForm}
                    >
                      {payrollStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    {formik.touched.status && formik.errors.status && (
                      <span className="text-sm text-red-500">{formik.errors.status}</span>
                    )}
                  </div>
                )}
                <div className="flex justify-end gap-2 mt-4 ml-280">
                  <Button
                    label="Cancel"
                    type="button"
                    onClick={() => {
                      setFormOpen(false);
                      setIsUpdate(false);
                      setSelectedPayrollId('');
                      formik.resetForm();
                      setSelectedEmployeeName(''); // Clear on cancel
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
                </div>
              </form>
            </div>
          </div>
        );
      }

        {/* View Payroll Details Modal */}
        if(viewingPayrollId){ 
          return(
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mt-10 w-full rounded bg-white p-6 shadow">
              {isLoadingViewingPayroll ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader />
                </div>
              ) : isErrorViewingPayroll ? (
                <div className="text-center text-red-500">Failed to load payroll details.</div>
              ) : viewingPayrollDetails ? (
                <>
                  <h3 className="mb-6 text-2xl font-bold text-gray-800 text-center flex items-center justify-center gap-2">Payroll Details</h3><br></br>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div><span className='block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1'>Employee Name:</span><p  className='text-gray-900 font-medium rounded-xl border border-gray-100 bg-purple-50 p-4'> {viewingPayrollDetails.employee_name}</p></div>
                    <div className=''><span className='block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1'>CTC:</span> <p  className='text-gray-900 font-medium rounded-xl border border-gray-100 bg-purple-50 p-4'> {viewingPayrollDetails.ctc}</p>
                    </div>
                    <div className='rounded-xl border border-gray-100 bg-purple-50 p-4 '><p  className='text-gray-900 font-medium'><span>Salary Per Month:</span> {viewingPayrollDetails.salary_per_month}</p>
                    </div>
                    <div className='rounded-xl border border-gray-100 bg-purple-50 p-4 '><p  className='text-gray-900 font-medium'><span>Deduction:</span> {viewingPayrollDetails.deduction}</p>
                    </div>
                    <div className='rounded-xl border border-gray-100 bg-purple-50 p-4 '><p  className='text-gray-900 font-medium'><span>Status:</span> {viewingPayrollDetails.status}</p>
                    </div>
                    <div className='rounded-xl border border-gray-100 bg-purple-50 p-4 '><p className="text-sm text-gray-500"><strong>Created At:</strong> {new Date(viewingPayrollDetails.created_at).toLocaleString()}</p>
                    </div>
                    <div className='rounded-xl border border-gray-100 bg-purple-50 p-4 '><p className="text-sm text-gray-500"><strong>Updated At:</strong> {new Date(viewingPayrollDetails.updated_at).toLocaleString()}</p>
                    </div>
                  </div>
                </>
              ) : null}
             <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseView}
                className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition"
              >
                close
              </button>
               </div>
            </div>
          </div>
        );
      }
 
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto mt-10 max-w-6xl rounded bg-white p-6 shadow">
        <div className="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <h2 className="text-gray-700 text-2xl  font-bold sm:text-left">Payroll Management</h2>
          {canAddPayroll && (
            <Button
              label="Add Payroll"
              onClick={() => {
                setFormOpen(true);
                setIsUpdate(false);
                setSelectedPayrollId('');
                formik.resetForm();
                formik.setFieldValue('status', 'Pending');
                setSelectedEmployeeName(''); // Clear previous employee name
              }}
              variant="primary"
              disabled={isSubmittingForm}
              className="w-full px-4 py-2 sm:w-auto"
            />
          )}
        </div>

        {/* Search Box Only */}
        <div className="mb-4 w-full px-4 py-3">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              <FiSearch />
            </span>
            <input
              type="text"
              placeholder="Search by employee name..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full rounded-md border px-4 py-3 pl-10 pr-10 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-300 text-gray-700"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
              >
                <FiX />
              </button>
            )}
          </div>
        </div>

        {/* Payrolls Table */}
        <div>
          <Table
            columns={payrollColumns}
            data={payrolls}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            actions={(payroll: Payroll) => (
              <div className="relative flex space-x-2">
                <button
                  onClick={() => handleView(payroll.id)}
                  className="text-blue-600 hover:text-blue-900"
                  title="View Details"
                >
                  <FiEye size={18} />
                </button>
                <ActionButtons
                  onUpdate={() => handleUpdate(payroll)}
                  onDelete={() => handleDelete(payroll.id)}
                  showView={false}
                />
                {deletingPayrollId === payroll.id && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-md bg-white bg-opacity-70">
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