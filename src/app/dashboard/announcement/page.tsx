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
interface Announcement {
  id: string;
  title: string;
  message: string;
  created_by: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  announcements: Announcement[];
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
  { label: 'Title', key: 'title' },
  { label: 'Message', key: 'message' },
  { label: 'Date', key: 'created_at', format: formatDate },
];

// fetchAnnouncements will fetch announcements with pagination and search
const fetchAnnouncements: QueryFunction<
  ApiResponse,
  ['announcements', number, number, string]
> = async ({ queryKey }) => {
  const [_key, currentPage, itemsPerPage, searchQuery] = queryKey;
  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found.');
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;

  let url = `${normalizedBaseUrl}announcements?page=${currentPage}&limit=${itemsPerPage}`;
  if (searchQuery) {
    url += `&search=${encodeURIComponent(searchQuery)}`;
  }

  try {
    const response = await callApi('get', url, null, {
      Authorization: `Bearer ${token}`,
    });
    return response as ApiResponse;
  } catch (error) {
    console.error('Error fetching announcements:', error);
    throw error;
  }
};

export default function AnnouncementPage() {
  useAuthRedirect();
  useProtectRoute();

  const queryClient = useQueryClient();

  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = sessionStorage.getItem('role_type')?.toLowerCase() || null;
    setUserRole(role);
  }, []);
  
  // This variable now determines if the user can see and perform actions
  const hasActionPermissions = userRole === 'super_admin' || userRole === 'admin' || userRole === 'hr';

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError, refetch } = useQuery<
    ApiResponse,
    Error,
    ApiResponse,
    ['announcements', number, number, string]
  >({
    queryKey: ['announcements', currentPage, itemsPerPage, searchQuery],
    queryFn: fetchAnnouncements,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const announcements = data?.announcements || [];
  const totalItems = data?.totalItems || 0;
  const totalPages = data?.totalPages || 1;

  const [formOpen, setFormOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState('');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [deletingAnnouncementId, setDeletingAnnouncementId] = useState<string | null>(null);

  const validationSchema = useMemo(() => {
    return Yup.object({
      title: Yup.string().required('Title is required'),
      message: Yup.string().required('Message is required'),
    });
  }, []);

  const formik = useFormik({
    initialValues: {
      title: '',
      message: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmittingForm(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
      const url = isUpdate ? `${normalizedBaseUrl}announcements/${selectedAnnouncementId}` : `${normalizedBaseUrl}announcements`;
      const method = isUpdate ? 'put' : 'post';

      try {
        await callApi(method, url, values, {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        });

        toast.success(`Announcement ${isUpdate ? 'updated' : 'created'} successfully!`);

        queryClient.invalidateQueries({ queryKey: ['announcements'] });
        setCurrentPage(1);

        setFormOpen(false);
        setIsUpdate(false);
        setSelectedAnnouncementId('');
        resetForm();
      } catch (error: unknown) {
        const apiError = error as ApiResponseError;
        toast.error(apiError?.response?.data?.detail || 'Something went wrong');
      } finally {
        setIsSubmittingForm(false);
      }
    },
  });

  const handleView = async (announcement: Announcement) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
    try {
      const response = await callApi('get', `${normalizedBaseUrl}announcements/${announcement.id}`, null, {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      });
      const announcementDetails = response as Announcement;
      toast.success(`Viewing: ${announcementDetails.title}`);
    } catch (error: unknown) {
      const apiError = error as ApiResponseError;
      toast.error(apiError?.response?.data?.detail || 'Failed to fetch announcement details');
    }
  };

  const handleUpdate = (announcement: Announcement) => {
    setSelectedAnnouncementId(announcement.id);
    setIsUpdate(true);
    formik.setValues({
      title: announcement.title,
      message: announcement.message,
    });
    setFormOpen(true);
  };

  const handleDelete = async (announcementId: string) => {
    setDeletingAnnouncementId(announcementId);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
      await callApi('delete', `${normalizedBaseUrl}announcements/${announcementId}`, null, {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      });

      toast.success('Announcement has been deleted.');
      queryClient.invalidateQueries({ queryKey: ['announcements'] });

      if (announcements.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (error: unknown) {
      const apiError = error as ApiResponseError;
      toast.error(apiError?.response?.data?.detail || 'Failed to delete announcement');
    } finally {
      setDeletingAnnouncementId(null);
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
        <p>Failed to load announcements. Please try again.</p>
        <Button onClick={() => refetch()} label="Retry" variant="primary" className="mt-4" />
      </div>
    );
  }
  

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto mt-10 max-w-4xl rounded bg-white p-6 shadow">
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-center sm:text-left">Announcement Board</h2>
          {hasActionPermissions && (
            <Button
              label="Add Announcement"
              onClick={() => {
                setFormOpen(true);
                setIsUpdate(false);
                setSelectedAnnouncementId('');
                formik.resetForm();
              }}
              variant="primary"
              disabled={isSubmittingForm}
              className="w-full sm:w-auto px-4 py-2"
            />
          )}
        </div>

        {/* Search Box for Announcements */}
        <div className="w-full px-4 py-3">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <FiSearch />
            </span>
            <input
              type="text"
              placeholder="Search by title or message..."
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

        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
              {isSubmittingForm && (
                <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-white bg-opacity-80">
                  <Loader />
                </div>
              )}
              <h3 className="mb-4 text-xl font-semibold">
                {isUpdate ? 'Update Announcement' : 'Create Announcement'}
              </h3>
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="mb-1 block">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    placeholder="e.g., New Holiday Policy"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full rounded border px-3 py-2"
                    disabled={isSubmittingForm}
                  />
                  {formik.touched.title && formik.errors.title && (
                    <span className="text-sm text-red-500">{formik.errors.title}</span>
                  )}
                </div>
                <div>
                  <label htmlFor="message" className="mb-1 block">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    placeholder="e.g., From next month, we are changing the company's holiday policy."
                    value={formik.values.message}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full rounded border px-3 py-2"
                    rows={4}
                    disabled={isSubmittingForm}
                  />
                  {formik.touched.message && formik.errors.message && (
                    <span className="text-sm text-red-500">{formik.errors.message}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <Button
                    label="Cancel"
                    type="button"
                    onClick={() => {
                      setFormOpen(false);
                      setIsUpdate(false);
                      setSelectedAnnouncementId('');
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
            data={announcements}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            {...(hasActionPermissions
              ? {
                  actions: (announcement: Announcement) => (
                    <div className="relative flex space-x-2">
                      <ActionButtons
                        onView={() => handleView(announcement)}
                        onUpdate={() => handleUpdate(announcement)}
                        onDelete={() => handleDelete(announcement.id)}
                        showView={true}
                      />
                      {deletingAnnouncementId === announcement.id && (
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