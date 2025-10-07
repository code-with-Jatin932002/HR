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

// Define interfaces for type safety, matching your API response
interface Feedback {
  id: string;
  organization_id: string;
  category: 'suggestion' | 'complaint' | 'idea';
  message: string;
  status: 'pending' | 'in_review' | 'resolved';
  created_at: string;
  updated_at: string;
}

interface PaginatedFeedbackResponse {
  feedbacks: Feedback[];
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

const columns = [
  { label: 'Category', key: 'category' },
  { label: 'Message', key: 'message' },
  { label: 'Status', key: 'status' },
  { label: 'Date', key: 'created_at', format: formatDate },
];

const fetchFeedbacks: QueryFunction<
  PaginatedFeedbackResponse,
  ['feedbacks', number, number, string]
> = async ({ queryKey }) => {
  const [_key, currentPage, itemsPerPage, searchQuery] = queryKey;
  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found.');
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;

  let url = `${normalizedBaseUrl}feedbacks?page=${currentPage}&limit=${itemsPerPage}`;
  if (searchQuery) {
    url += `&search=${encodeURIComponent(searchQuery)}`;
  }

  try {
    const response = await callApi('get', url, null, {
      Authorization: `Bearer ${token}`,
    });
    return response as PaginatedFeedbackResponse;
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    throw error;
  }
};

export default function FeedbackPage() {
  useAuthRedirect();
  useProtectRoute();

  const queryClient = useQueryClient();

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = sessionStorage.getItem('role_type')?.toLowerCase() || null;
    setUserRole(role);
  }, []);

  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError, refetch } = useQuery<
    PaginatedFeedbackResponse,
    Error,
    PaginatedFeedbackResponse,
    ['feedbacks', number, number, string]
  >({
    queryKey: ['feedbacks', currentPage, itemsPerPage, searchQuery],
    queryFn: fetchFeedbacks,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const feedbacks = data?.feedbacks || [];
  const totalItems = data?.totalItems || 0;
  const totalPages = data?.totalPages || 1;

  const [formOpen, setFormOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState('');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [deletingFeedbackId, setDeletingFeedbackId] = useState<string | null>(null);

  const validationSchema = useMemo(() => {
    if (isAdmin) {
      return Yup.object({
        category: Yup.string().oneOf(['suggestion', 'complaint', 'idea']).required('Category is required'),
        message: Yup.string().required('Message is required'),
        status: Yup.string().oneOf(['pending', 'in_review', 'resolved']).optional(),
      });
    }
    return Yup.object({
      category: Yup.string().oneOf(['suggestion', 'complaint', 'idea']).required('Category is required'),
      message: Yup.string().required('Message is required'),
    });
  }, [isAdmin]);

  const formik = useFormik({
    initialValues: {
      category: 'suggestion',
      message: '',
      status: 'pending',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmittingForm(true);
      const token = sessionStorage.getItem('token');
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
      const url = isUpdate ? `${normalizedBaseUrl}feedbacks/${selectedFeedbackId}` : `${normalizedBaseUrl}feedbacks`;
      const method = isUpdate ? 'put' : 'post';

      const payload = {
        category: values.category,
        message: values.message,
        // Only include status if it's an update and the user is an admin
        ...(isAdmin || isUpdate ? { status: values.status } : {}), 
      };

      try {
        await callApi(method, url, payload, {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        });

        toast.success(`Feedback ${isUpdate ? 'updated' : 'created'} successfully!`);
        queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
        setCurrentPage(1);
        setFormOpen(false);
        setIsUpdate(false);
        setSelectedFeedbackId('');
        resetForm();
      } catch (error: unknown) {
        const apiError = error as ApiResponseError;
        toast.error(apiError?.response?.data?.detail || 'Something went wrong');
      } finally {
        setIsSubmittingForm(false);
      }
    },
  });

  const handleView = async (feedback: Feedback) => {
    // This is a placeholder for actual view logic, currently it just shows a toast.
    toast(`Viewing feedback: ${feedback.category}`, { icon: '👁️' });
    // If you need to show a modal with details, you would implement that state and component here.
  };

  const handleUpdate = (feedback: Feedback) => {
    setSelectedFeedbackId(feedback.id);
    setIsUpdate(true);
    formik.setValues({
      category: feedback.category,
      message: feedback.message,
      status: feedback.status,
    });
    setFormOpen(true);
  };

  const handleDelete = async (feedbackId: string) => {
    setDeletingFeedbackId(feedbackId);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
      await callApi('delete', `${normalizedBaseUrl}feedbacks/${feedbackId}`, null, {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      });

      toast.success('Feedback has been deleted.');
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });

      if (feedbacks.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    } catch (error: unknown) {
      const apiError = error as ApiResponseError;
      toast.error(apiError?.response?.data?.detail || 'Failed to delete feedback');
    } finally {
      setDeletingFeedbackId(null);
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
        <p>Failed to load feedbacks. Please try again.</p>
        <Button onClick={() => refetch()} label="Retry" variant="primary" className="mt-4" />
      </div>
    );
  }
    
  // ----------------------------------------------------------------------
  // Create/Update Feedback Form Block (Updated for full width)
  // ----------------------------------------------------------------------
  if(formOpen){
    return(
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Changed max-w-xl to max-w-6xl for wider form like previous page */}
        <div className="mx-auto mt-10 max-w-6xl rounded-lg bg-white p-8 shadow-2xl relative"> 
          {isSubmittingForm && (
            <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-white bg-opacity-80">
              <Loader />
            </div>
          )}
          
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-2xl font-semibold text-gray-700">
              {isUpdate ? 'Update Feedback' : 'Create New Feedback'}
            </h3>
            <button
              className="text-gray-400 hover:text-gray-700 transition"
              onClick={() => {
                setFormOpen(false);
                setIsUpdate(false);
                setSelectedFeedbackId('');
                formik.resetForm();
              }}
              disabled={isSubmittingForm}
            >
              <FiX size={24} />
            </button>
          </div>
          
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            
            {/* Category Select Input */}
            <div>
              <label htmlFor="category" className="mb-2.5 block text-sm font-medium text-black">Category</label>
              <div className="relative">
                <select
                  id="category"
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`
                    w-full rounded-lg border py-4 pl-6 pr-10 text-black outline-none transition duration-300 appearance-none
                    ${
                      formik.touched.category && formik.errors.category ? 'border-red-500' : 'border-gray-300'
                    }
                    focus:border-purple-600 focus:shadow-md
                  `}
                  disabled={isSubmittingForm}
                >
                  <option value="suggestion">Suggestion</option>
                  <option value="complaint">Complaint</option>
                  <option value="idea">Idea</option>
                </select>
                {/* Custom chevron icon for dropdown */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
              </div>
              {formik.touched.category && formik.errors.category && (
                <span className="mt-1 block text-sm text-red-500">{formik.errors.category}</span>
              )}
            </div>
            
            {/* Message Textarea */}
            <div>
              <label htmlFor="message" className="mb-2.5 block text-sm font-medium text-black">Message</label>
              <textarea
                id="message"
                name="message"
                placeholder="e.g., The office is too cold. Or, I have an idea for a new feature..."
                rows={4}
                value={formik.values.message}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`
                  w-full rounded-lg border py-4 pl-6 pr-6 text-black outline-none transition duration-300
                  ${
                    formik.touched.message && formik.errors.message ? 'border-red-500' : 'border-gray-300'
                  }
                  focus:border-purple-600 focus:shadow-md resize-none
                `}
                disabled={isSubmittingForm}
              />
              {formik.touched.message && formik.errors.message && (
                <span className="mt-1 block text-sm text-red-500">{formik.errors.message}</span>
              )}
            </div>
            
            {/* Status Select Input (Admin Only on Update) */}
            {isAdmin && isUpdate && (
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
                      w-full rounded-lg border py-4 pl-6 pr-10 text-black outline-none transition duration-300 appearance-none
                      ${
                        formik.touched.status && formik.errors.status ? 'border-red-500' : 'border-gray-300'
                      }
                      focus:border-purple-600 focus:shadow-md
                    `}
                    disabled={isSubmittingForm}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_review">In Review</option>
                    <option value="resolved">Resolved</option>
                  </select>
                   {/* Custom chevron icon for dropdown */}
                   <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
                {formik.touched.status && formik.errors.status && (
                  <span className="mt-1 block text-sm text-red-500">{formik.errors.status}</span>
                )}
              </div>
            )}
            
            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                label="Cancel"
                type="button"
                onClick={() => {
                  setFormOpen(false);
                  setIsUpdate(false);
                  setSelectedFeedbackId('');
                  formik.resetForm();
                }}
                variant="secondary"
                disabled={isSubmittingForm}
              />
              <Button
                label={isUpdate ? 'Update Feedback' : 'Submit Feedback'}
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


  // ----------------------------------------------------------------------
  // Main Table View 
  // ----------------------------------------------------------------------
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      {/* Table container with max-w-full (effectively full width within padding) */}
      <div className="mx-auto mt-10 max-w-full rounded bg-white p-6 shadow">
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-3xl font-bold text-gray-700 sm:text-left">Feedback Board</h2>
          {!isAdmin && (
            <Button
              label="Add Feedback"
              onClick={() => {
                setFormOpen(true);
                setIsUpdate(false);
                setSelectedFeedbackId('');
                formik.resetForm();
              }}
              variant="primary"
              disabled={isSubmittingForm}
              className="w-full sm:w-auto px-4 py-2"
            />
          )}
        </div>

        <div className="w-full mb-6">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <FiSearch />
            </span>
            <input
              type="text"
              placeholder="Search by category or message..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full rounded-lg border px-4 py-3 pl-10 pr-10 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-300 text-gray-700 transition duration-300"
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
          <Table
            columns={columns}
            data={feedbacks}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            {...(isAdmin
              ? {
                  actions: (feedback: Feedback) => (
                    <div className="relative flex space-x-2">
                      <ActionButtons
                        onView={() => handleView(feedback)}
                        onUpdate={() => handleUpdate(feedback)}
                        onDelete={() => handleDelete(feedback.id)}
                        showView={true}
                      />
                      {deletingFeedbackId === feedback.id && (
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