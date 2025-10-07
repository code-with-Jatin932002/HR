'use client';
import { useQuery, useQueryClient, QueryFunction } from '@tanstack/react-query';
import { useState, useMemo, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';
// Import FiChevronDown for the standard dropdown arrow
import { FiSearch, FiX, FiMapPin, FiDollarSign, FiChevronDown } from 'react-icons/fi';
import { FaRupeeSign } from "react-icons/fa";

import callApi from '@/utils/callApi';
import useAuthRedirect from '@/hooks/useAuthRedirect';
import useProtectRoute from '@/hooks/useProtectRoute';
import Loader from '@/components/Loader';
import Button from '@/components/Button';
import Pagination from '@/components/Pagination';
import ActionButtons from '@/components/ActionButtons';

// Define interfaces for type safety
interface Job {
  id: string;
  department: string;
  job_title: string;
  location: string;
  amount: number;
  job_type: 'office' | 'work from home' | 'hybrid';
  status: 'active' | 'inactive' | 'completed';
  organization_id: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  jobs: Job[];
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

// Interface for Department list for dropdown
interface Department {
  id: string;
  department_name: string;
}

interface DepartmentsApiResponse {
  departments: Department[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

const jobTypeOptions = [
  { label: 'Office', value: 'office' },
  { label: 'Work From Home', value: 'work from home' },
  { label: 'Hybrid', value: 'hybrid' },
];

const jobStatusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Completed', value: 'completed' },
];

// fetchJobs now only takes page, limit, and search query
const fetchJobs: QueryFunction<
  ApiResponse,
  ['jobs', number, number, string]
> = async ({ queryKey }) => {
  const [_key, currentPage, itemsPerPage, searchQuery] = queryKey;
  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found.');
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
  const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;

  let url = `${normalizedBaseUrl}jobs?page=${currentPage}&limit=${itemsPerPage}`;
  if (searchQuery) {
    url += `&search=${encodeURIComponent(searchQuery)}`;
  }

  try {
    const response = await callApi('get', url, null, {
      Authorization: `Bearer ${token}`,
    });
    return response as ApiResponse;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

const fetchDepartmentsList: QueryFunction<
  DepartmentsApiResponse,
  ['departmentsList']
> = async ({ queryKey }) => {
  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found.');
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
  const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;

  let url = `${normalizedBaseUrl}department?page=1&limit=1000`; // Fetch a large number to get all for dropdown

  try {
    const response = await callApi('get', url, null, {
      Authorization: `Bearer ${token}`,
    });
    return response as DepartmentsApiResponse;
  } catch (error) {
    console.error('Error fetching departments list:', error);
    throw error;
  }
};


export default function JobsPage() {
  useAuthRedirect();
  useProtectRoute();

  const queryClient = useQueryClient();

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = sessionStorage.getItem('role_type')?.toLowerCase() || null;
    setUserRole(role);
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError, refetch } = useQuery<
    ApiResponse,
    Error,
    ApiResponse,
    ['jobs', number, number, string]
  >({
    queryKey: ['jobs', currentPage, itemsPerPage, searchQuery],
    queryFn: fetchJobs,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const { data: departmentsData } = useQuery<DepartmentsApiResponse, Error, DepartmentsApiResponse, ['departmentsList']>({
    queryKey: ['departmentsList'],
    queryFn: fetchDepartmentsList,
    staleTime: Infinity,
  });

  const departmentsList = useMemo(() => {
    return departmentsData?.departments.map(dept => dept.department_name) || [];
  }, [departmentsData]);

  // Jobs from API response (already filtered by search query if any)
  const jobs = data?.jobs || [];
  const totalItems = data?.totalItems || 0;
  const totalPages = data?.totalPages || 1;

  // Client-side filtering for display into columns
  const activeJobs = useMemo(() => jobs.filter(job => job.status === 'active'), [jobs]);
  const inactiveJobs = useMemo(() => jobs.filter(job => job.status === 'inactive'), [jobs]);
  const completedJobs = useMemo(() => jobs.filter(job => job.status === 'completed'), [jobs]);

  const [formOpen, setFormOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  const validationSchema = useMemo(() => {
    return Yup.object({
      department: Yup.string().required('Department is required'),
      job_title: Yup.string().required('Job Title is required'),
      location: Yup.string().required('Location is required'),
      amount: Yup.number()
        .typeError('Amount must be a number')
        .positive('Amount must be positive')
        .required('Amount is required'),
      job_type: Yup.string()
        .oneOf(jobTypeOptions.map(opt => opt.value), 'Invalid Job Type')
        .required('Job Type is required'),
      status: Yup.string().oneOf(jobStatusOptions.map(opt => opt.value), 'Invalid Status'),
    });
  }, []);

  const formik = useFormik({
    initialValues: {
      department: '',
      job_title: '',
      location: '',
      amount: 0,
      job_type: 'office' as 'office' | 'work from home' | 'hybrid',
      status: 'active' as 'active' | 'inactive' | 'completed',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmittingForm(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
      const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
      const url = isUpdate ? `${normalizedBaseUrl}jobs/${selectedJobId}` : `${normalizedBaseUrl}jobs`;
      const method = isUpdate ? 'put' : 'post';

      const payload = isUpdate ? values : { ...values, status: 'active' };

      try {
        await callApi(method, url, payload, {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        });

        toast.success(`Job ${isUpdate ? 'updated' : 'created'} successfully!`);

        queryClient.invalidateQueries({ queryKey: ['jobs'] });
        setCurrentPage(1); // Reset to first page after add/update

        setFormOpen(false);
        setIsUpdate(false);
        setSelectedJobId('');
        resetForm();
      } catch (error: unknown) {
        const apiError = error as ApiResponseError;
        toast.error(apiError?.response?.data?.detail || 'Something went wrong');
      } finally {
        setIsSubmittingForm(false);
      }
    },
  });

  const handleUpdate = (job: Job) => {
    setSelectedJobId(job.id);
    setIsUpdate(true);
    formik.setValues({
      department: job.department,
      job_title: job.job_title,
      location: job.location,
      amount: job.amount,
      job_type: job.job_type,
      status: job.status,
    });
    setFormOpen(true);
  };

  const handleDeleteJob = async (jobId: string) => {
    setDeletingJobId(jobId);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
      const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
      await callApi('delete', `${normalizedBaseUrl}jobs/${jobId}`, null, {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      });

      toast.success('Job has been deleted.');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });

      // If the last item on a page is deleted, go to the previous page
      if (jobs.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (error: unknown) {
      const apiError = error as ApiResponseError;
      toast.error(apiError?.response?.data?.detail || 'Failed to delete job');
    } finally {
      setDeletingJobId(null);
    }
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset page to 1 on new search
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
        <p>Failed to load jobs. Please try again.</p>
        <Button onClick={() => refetch()} label="Retry" variant="primary" className="mt-4" />
      </div>
    );
  }

  // Determine if the current user is an admin, HR, or super_admin
  const canManageJobs = userRole === 'super_admin' || userRole === 'admin' || userRole === 'hr';

  // ----------------------------------------------------------------------
  // Job Form Block (Updated to restore max-w-6xl for wider form width)
  // ----------------------------------------------------------------------
  if(formOpen){
    return(
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Restored max-w-6xl for wider form content */}
        <div className="mx-auto mt-10 max-w-6xl rounded bg-white p-6 shadow relative"> 
          {isSubmittingForm && (
            <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-white bg-opacity-80">
              <Loader />
            </div>
          )}
        
          <h3 className="mb-6 text-2xl font-semibold text-gray-700">
            {isUpdate ? 'Update Job' : 'Create New Job'}
          </h3>
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* All fields are now full width and stack vertically */}

            {/* Job Title */}
            <div>
              <label htmlFor="job_title" className="mb-2.5 block text-sm font-medium text-black">Job Title</label>
              <div className="relative">
                <input
                  type="text"
                  id="job_title"
                  name="job_title"
                  value={formik.values.job_title}
                  placeholder='Enter Job Title'
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`
                    w-full rounded-lg border py-4 pl-6 pr-6 text-black outline-none transition duration-300
                    ${
                      formik.touched.job_title && formik.errors.job_title ? 'border-red-500' : 'border-gray-300'
                    }
                    focus:border-purple-600
                  `}
                  disabled={isSubmittingForm}
                />
              </div>
              {formik.touched.job_title && formik.errors.job_title && (
                <span className="mt-1 block text-sm text-red-500">{formik.errors.job_title}</span>
              )}
            </div>

            {/* Department Dropdown */}
            <div>
              <label htmlFor="department" className="mb-2.5 block text-sm font-medium text-black">Department</label>
              <div className="relative">
                <select
                  id="department"
                  name="department"
                  value={formik.values.department}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`
                    w-full rounded-lg border py-4 pl-6 pr-12 text-black outline-none transition duration-300 appearance-none
                    ${
                      formik.touched.department && formik.errors.department ? 'border-red-500' : 'border-gray-300'
                    }
                    focus:border-purple-600
                  `}
                  disabled={isSubmittingForm}
                >
                  <option value="">Select Department</option>
                  {departmentsList.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {/* Dropdown Icon */}
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {formik.touched.department && formik.errors.department && (
                <span className="mt-1 block text-sm text-red-500">{formik.errors.department}</span>
              )}
            </div>

            {/* Location Input with Icon */}
            <div>
              <label htmlFor="location" className="mb-2.5 block text-sm font-medium text-black">Location</label>
              <div className="relative">
                <input
                  type="text"
                  id="location"
                  name="location"
                  placeholder='Enter Location'
                  value={formik.values.location}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`
                    w-full rounded-lg border py-4 pl-12 pr-6 text-black outline-none transition duration-300
                    ${
                      formik.touched.location && formik.errors.location ? 'border-red-500' : 'border-gray-300'
                    }
                    focus:border-purple-600
                  `}
                  disabled={isSubmittingForm}
                />
                <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              {formik.touched.location && formik.errors.location && (
                <span className="mt-1 block text-sm text-red-500">{formik.errors.location}</span>
              )}
            </div>

            {/* Amount Input with Rupee Icon */}
            <div>
              <label htmlFor="amount" className="mb-2.5 block text-sm font-medium text-black">Amount (per month)</label>
              <div className="relative">
                {/* Rupee Sign Prefix */}
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 font-semibold text-lg pointer-events-none">₹</span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  placeholder='Enter Amount'
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`
                    w-full rounded-lg border py-4 pl-10 pr-6 text-black outline-none transition duration-300
                    ${
                      formik.touched.amount && formik.errors.amount ? 'border-red-500' : 'border-gray-300'
                    }
                    focus:border-purple-600
                  `}
                  disabled={isSubmittingForm}
                />
              </div>
              {formik.touched.amount && formik.errors.amount && (
                <span className="mt-1 block text-sm text-red-500">{formik.errors.amount}</span>
              )}
            </div>
            
            {/* Job Type Dropdown */}
            <div>
              <label htmlFor="job_type" className="mb-2.5 block text-sm font-medium text-black">Job Type</label>
              <div className="relative">
                <select
                  id="job_type"
                  name="job_type"
                  value={formik.values.job_type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`
                    w-full rounded-lg border py-4 pl-6 pr-12 text-black outline-none transition duration-300 appearance-none
                    ${
                      formik.touched.job_type && formik.errors.job_type ? 'border-red-500' : 'border-gray-300'
                    }
                    focus:border-purple-600
                  `}
                  disabled={isSubmittingForm}
                >
                  {jobTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {/* Dropdown Icon */}
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              {formik.touched.job_type && formik.errors.job_type && (
                <span className="mt-1 block text-sm text-red-500">{formik.errors.job_type}</span>
              )}
            </div>
          
            {/* Status Dropdown (Only for Update) */}
            {isUpdate && (
              <div>
                <label htmlFor="status" className="mb-2.5 block text-sm font-medium text-black">Status</label>
                <div className="relative">
                  <select
                    id="status"
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`
                      w-full rounded-lg border py-4 pl-6 pr-12 text-black outline-none transition duration-300 appearance-none
                      ${
                        formik.touched.status && formik.errors.status ? 'border-red-500' : 'border-gray-300'
                      }
                      focus:border-purple-600
                    `}
                    disabled={isSubmittingForm}
                  >
                    {jobStatusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {/* Dropdown Icon */}
                  <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {formik.touched.status && formik.errors.status && (
                  <span className="mt-1 block text-sm text-red-500">{formik.errors.status}</span>
                )}
              </div>
            )}
            
            <div className="flex justify-end gap-4 pt-4">
              <Button
                label="Cancel"
                type="button"
                onClick={() => {
                  setFormOpen(false);
                  setIsUpdate(false);
                  setSelectedJobId('');
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
  // ----------------------------------------------------------------------
  // Main Table View (No changes here, keeping for completeness)
  // ----------------------------------------------------------------------
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto mt-10 max-w-7xl rounded bg-white p-6 shadow">
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-700 sm:text-left">Job Management</h2>
          {canManageJobs && (
            <Button
              label="Add New Job"
              onClick={() => {
                setFormOpen(true);
                setIsUpdate(false);
                setSelectedJobId('');
                formik.resetForm();
                formik.setFieldValue('status', 'active'); // Default status for new jobs
              }}
              variant="primary"
              disabled={isSubmittingForm}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
            />
          )}
        </div>

        {/* Search Bar - Full Width */}
        <div className="w-full mb-6">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <FiSearch />
            </span>
            <input
              type="text"
              placeholder="Search by job title..."
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

        {/* Job Listings by Status */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Jobs */}
          <JobStatusColumn
            title="Active Jobs"
            jobs={activeJobs}
            statusColor="bg-green-500"
            canManageJobs={canManageJobs}
            onUpdate={handleUpdate}
            onDelete={handleDeleteJob}
            deletingJobId={deletingJobId}
          />

          {/* Inactive Jobs */}
          <JobStatusColumn
            title="Inactive Jobs"
            jobs={inactiveJobs}
            statusColor="bg-yellow-500"
            canManageJobs={canManageJobs}
            onUpdate={handleUpdate}
            onDelete={handleDeleteJob}
            deletingJobId={deletingJobId}
          />

          {/* Completed Jobs */}
          <JobStatusColumn
            title="Completed Jobs"
            jobs={completedJobs}
            statusColor="bg-red-500"
            canManageJobs={canManageJobs}
            onUpdate={handleUpdate}
            onDelete={handleDeleteJob}
            deletingJobId={deletingJobId}
          />
        </div>

        {totalItems > 0 && ( // Ensure pagination only shows if there are jobs
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between">
            <p className="text-sm text-gray-700 mb-4 sm:mb-0">
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
        )}
      </div>
    </div>
  );
}

// Helper component for rendering job columns
interface JobStatusColumnProps {
  title: string;
  jobs: Job[];
  statusColor: string;
  canManageJobs: boolean;
  onUpdate: (job: Job) => void;
  onDelete: (jobId: string) => void;
  deletingJobId: string | null;
}

const JobStatusColumn: React.FC<JobStatusColumnProps> = ({
  title,
  jobs,
  statusColor,
  canManageJobs,
  onUpdate,
  onDelete,
  deletingJobId,
}) => {
  return (
    <div className="col-span-1 border rounded-lg shadow-sm p-4">
      <div className="flex items-center mb-4">
        <span className={`w-3 h-3 rounded-full mr-2 ${statusColor}`}></span>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <p className="text-gray-500 text-sm">No {title.toLowerCase()} found.</p>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="bg-gray-50 p-4 rounded-md shadow-sm relative">
              {deletingJobId === job.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-md">
                  <Loader />
                </div>
              )}
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-gray-900">{job.job_title}</h4>
                  <p className="text-sm text-gray-600">{job.department}</p>
                </div>
                {/* ActionButtons: Visible if canManageJobs is true */}
                {canManageJobs && (
                  <ActionButtons
                    onUpdate={() => onUpdate(job)}
                    onDelete={() => onDelete(job.id)}
                    showView={false}
                  />
                )}
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                <p className="flex items-center">
                  <FiMapPin className="mr-1 text-gray-500" size={14} /> {job.location}
                </p>
                <p className="flex items-center">
                  <FaRupeeSign className="mr-1 text-gray-500" size={14} /> {job.amount.toLocaleString()}/Month
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {job.department}
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {job.job_type === 'work from home' ? 'Remote' : job.job_type}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};