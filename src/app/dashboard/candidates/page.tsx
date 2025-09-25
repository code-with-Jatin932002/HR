'use client';
import { useQuery, useQueryClient, QueryFunction } from '@tanstack/react-query';
import { useState, useMemo, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FiSearch, FiX } from 'react-icons/fi';

import callApi from '@/utils/callApi';
import useAuthRedirect from '@/hooks/useAuthRedirect';
import useProtectRoute from '@/hooks/useProtectRoute';
import Table from '@/components/Table';
import ActionButtons from '@/components/ActionButtons';
import Loader from '@/components/Loader';
import Button from '@/components/Button';
import Pagination from '@/components/Pagination';

// Define interfaces for type safety
interface Candidate {
  id: string;
  candidate_name: string;
  applied_for: string;
  applied_date: string;
  email: string;
  mobile_number: string;
  status: 'Shortlisted' | 'Pending' | 'Interview Scheduled' | 'Rejected';
}

interface ApiResponse {
  candidates: Candidate[];
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
  { label: 'Candidate Name', key: 'candidate_name' },
  { label: 'Applied For', key: 'applied_for' },
  { label: 'Applied Date', key: 'applied_date' },
  { label: 'Email', key: 'email' },
  { label: 'Mobile Number', key: 'mobile_number' },
  { label: 'Status', key: 'status' },
];

const statusOptions = [
  'Pending',
  'Shortlisted',
  'Interview Scheduled',
  'Rejected',
];

// fetchCandidates will now only take page, limit, and search query
const fetchCandidates: QueryFunction<
  ApiResponse,
  ['candidates', number, number, string]
> = async ({ queryKey }) => {
  const [_key, currentPage, itemsPerPage, searchQuery] = queryKey;
  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found.');
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;

  let url = `${normalizedBaseUrl}candidates?page=${currentPage}&limit=${itemsPerPage}`;
  if (searchQuery) {
    url += `&search=${encodeURIComponent(searchQuery)}`;
  }

  try {
    const response = await callApi('get', url, null, {
      Authorization: `Bearer ${token}`,
    });
    return response as ApiResponse;
  } catch (error) {
    console.error('Error fetching candidates:', error);
    throw error;
  }
};

export default function CandidatePage() {
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
    ['candidates', number, number, string]
  >({
    queryKey: ['candidates', currentPage, itemsPerPage, searchQuery],
    queryFn: fetchCandidates,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const candidates = data?.candidates || [];
  const totalItems = data?.totalItems || 0;
  const totalPages = data?.totalPages || 1;

  const [formOpen, setFormOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [deletingCandidateId, setDeletingCandidateId] = useState<string | null>(null);

  const validationSchema = useMemo(() => {
    return Yup.object({
      candidate_name: Yup.string().required('Candidate name is required'),
      applied_for: Yup.string().required('Position applied for is required'),
      applied_date: Yup.date().required('Applied date is required').typeError('Invalid date format'),
      email: Yup.string().email('Invalid email format').required('Email is required'),
      mobile_number: Yup.string().required('Mobile number is required').matches(/^\d{10}$/, 'Mobile number must be 10 digits'),
      status: Yup.string().oneOf(statusOptions, 'Invalid status').required('Status is required'),
    });
  }, []);

  const formik = useFormik({
    initialValues: {
      candidate_name: '',
      applied_for: '',
      applied_date: '',
      email: '',
      mobile_number: '',
      status: statusOptions[0], // Default to the first status option
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmittingForm(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
      const url = isUpdate ? `${normalizedBaseUrl}candidates/${selectedCandidateId}` : `${normalizedBaseUrl}candidates`;
      const method = isUpdate ? 'put' : 'post';

      try {
        await callApi(method, url, values, {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        });

        toast.success(`Candidate ${isUpdate ? 'updated' : 'created'} successfully!`);

        queryClient.invalidateQueries({ queryKey: ['candidates'] });
        setCurrentPage(1);

        setFormOpen(false);
        setIsUpdate(false);
        setSelectedCandidateId('');
        resetForm();
      } catch (error: unknown) {
        const apiError = error as ApiResponseError;
        toast.error(apiError?.response?.data?.detail || 'Something went wrong');
      } finally {
        setIsSubmittingForm(false);
      }
    },
  });

  const handleView = async (candidate: Candidate) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
    try {
      const response = await callApi('get', `${normalizedBaseUrl}candidates/${candidate.id}`, null, {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      });
      const candidateDetails = response as Candidate;
      toast.success(`Viewing: ${candidateDetails.candidate_name}, Applied for: ${candidateDetails.applied_for}`);
    } catch (error: unknown) {
      const apiError = error as ApiResponseError;
      toast.error(apiError?.response?.data?.detail || 'Failed to fetch candidate details');
    }
  };

  const handleUpdate = (candidate: Candidate) => {
    setSelectedCandidateId(candidate.id);
    setIsUpdate(true);
    formik.setValues({
      candidate_name: candidate.candidate_name,
      applied_for: candidate.applied_for,
      applied_date: candidate.applied_date,
      email: candidate.email,
      mobile_number: candidate.mobile_number,
      status: candidate.status,
    });
    setFormOpen(true);
  };

  const handleDelete = async (candidateId: string) => {
    setDeletingCandidateId(candidateId);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
      await callApi('delete', `${normalizedBaseUrl}candidates/${candidateId}`, null, {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      });

      toast.success('Candidate has been deleted.');
      queryClient.invalidateQueries({ queryKey: ['candidates'] });

      if (candidates.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (error: unknown) {
      const apiError = error as ApiResponseError;
      toast.error(apiError?.response?.data?.detail || 'Failed to delete candidate');
    } finally {
      setDeletingCandidateId(null);
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

  // Determine if the current user can add candidates (HR, Manager)
  const canAddCandidate = userRole === 'hr' || userRole === 'manager';

  // Determine if the current user can see actions (HR, Manager)
  const canSeeActions = userRole === 'hr' || userRole === 'manager';

  if (isLoading || userRole === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-red-500">
        <p>Failed to load candidates. Please try again.</p>
        <Button onClick={() => refetch()} label="Retry" variant="primary" className="mt-4" />
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto mt-10 max-w-6xl rounded bg-white p-6 shadow">
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-700 sm:text-left">Candidate Management</h2>
          {canAddCandidate && (
            <Button
              label="Add Candidate"
              onClick={() => {
                setFormOpen(true);
                setIsUpdate(false);
                setSelectedCandidateId('');
                formik.resetForm();
                formik.setFieldValue('status', statusOptions[0]);
              }}
              variant="primary"
              disabled={isSubmittingForm}
              className="w-full sm:w-auto px-4 py-2"
            />
          )}
        </div>

        {/* Search Box for Candidates */}
        <div className="w-full px-4 py-3">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <FiSearch />
            </span>
            <input
              type="text"
              placeholder="Search by name, email, or mobile..."
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

        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-50 p-4">
            <div className="relative w-350 rounded-lg bg-white p-6 shadow-lg h-140 ">
              {isSubmittingForm && (
                <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-white bg-opacity-80">
                  <Loader />
                </div>
              )}
              <h3 className="mb-4 text-xl font-semibold text-gray-700">
                {isUpdate ? 'Update Candidate' : 'Create Candidate'}
              </h3>
              <br></br>
              <form onSubmit={formik.handleSubmit} className="space-y-4">
               <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <div>
                  <label htmlFor="candidate_name" className="mb-1 block text-sm font-medium text-gray-700">Candidate Name</label>
                  <input
                    type="text"
                    id="candidate_name"
                    name="candidate_name"
                    value={formik.values.candidate_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
                    disabled={isSubmittingForm}
                  />
                  {formik.touched.candidate_name && formik.errors.candidate_name && (
                    <span className="text-sm text-red-500">{formik.errors.candidate_name}</span>
                  )}
                </div>
                <div>
                  <label htmlFor="applied_for" className="mb-1 block text-sm font-medium text-gray-700">Applied For</label>
                  <input
                    type="text"
                    id="applied_for"
                    name="applied_for"
                    value={formik.values.applied_for}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300-full rounded border px-3 py-2"
                    disabled={isSubmittingForm}
                  />
                  {formik.touched.applied_for && formik.errors.applied_for && (
                    <span className="text-sm text-red-500">{formik.errors.applied_for}</span>
                  )}
                </div>
                <div>
                  <label htmlFor="applied_date" className="mb-1 block text-sm font-medium text-gray-700">Applied Date</label>
                  <input
                    type="date"
                    id="applied_date"
                    name="applied_date"
                    value={formik.values.applied_date}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
                    disabled={isSubmittingForm}
                  />
                  {formik.touched.applied_date && formik.errors.applied_date && (
                    <span className="text-sm text-red-500">{formik.errors.applied_date}</span>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
                    disabled={isSubmittingForm}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <span className="text-sm text-red-500">{formik.errors.email}</span>
                  )}
                </div>
                <div>
                  <label htmlFor="mobile_number" className="mb-1 block text-sm font-medium text-gray-700">Mobile Number</label>
                  <input
                    type="text"
                    id="mobile_number"
                    name="mobile_number"
                     maxLength={10}
                     pattern="\d*"
                    value={formik.values.mobile_number}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
                    disabled={isSubmittingForm}
                  />
                  {formik.touched.mobile_number && formik.errors.mobile_number && (
                    <span className="text-sm text-red-500">{formik.errors.mobile_number}</span>
                  )}
                </div>
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
                    {statusOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {formik.touched.status && formik.errors.status && (
                    <span className="text-sm text-red-500">{formik.errors.status}</span>
                  )}
                </div>
              </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    label="Cancel"
                    type="button"
                    onClick={() => {
                      setFormOpen(false);
                      setIsUpdate(false);
                      setSelectedCandidateId('');
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
        )}

        <div>
          <Table
            columns={columns}
            data={candidates}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            {...(canSeeActions
              ? {
                  actions: (candidate: Candidate) => (
                    <div className="relative flex space-x-2">
                      <ActionButtons
                        onView={() => handleView(candidate)}
                        onUpdate={() => handleUpdate(candidate)}
                        onDelete={() => handleDelete(candidate.id)}
                        showView={true}
                      />
                      {deletingCandidateId === candidate.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 rounded-md">
                          <Loader />
                        </div>
                      )}
                    </div>
                  ),
                }
              : {}
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