'use client';
import { useQuery, useQueryClient, QueryFunction } from '@tanstack/react-query';
import { useState, useMemo, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FiSearch, FiX, FiChevronDown } from 'react-icons/fi'; // Added FiChevronDown for dropdown

// Importing icons for input fields
import { FaCalendarAlt, FaTag } from 'react-icons/fa'; // FaSun is replaced by FiChevronDown

import callApi from '@/utils/callApi';
import useAuthRedirect from '@/hooks/useAuthRedirect';
import useProtectRoute from '@/hooks/useProtectRoute';
import Table from '@/components/Table';
import ActionButtons from '@/components/ActionButtons';
import Loader from '@/components/Loader';
import Button from '@/components/Button';
import Pagination from '@/components/Pagination';

// Define interfaces for type safety
interface Holiday {
  id: string;
  date: string; // Changed from holiday_date to date based on create schema
  day: string;
  holiday_name: string;
}

interface ApiResponse {
  holidays: Holiday[];
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
  { label: 'Holiday Name', key: 'holiday_name' },
  { label: 'Date', key: 'date' },
  { label: 'Day', key: 'day' },
  // No explicit column for actions here, ActionButtons will be rendered directly
];

// Array for the Day dropdown options
const daysOfTheWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];


// fetchHolidays will now explicitly take page, limit, and search query
const fetchHolidays: QueryFunction<
  ApiResponse,
  ['holidays', number, number, string]
> = async ({ queryKey }) => {
  const [_key, currentPage, itemsPerPage, searchQuery] = queryKey;
  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found.');
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;

  let url = `${normalizedBaseUrl}holidays?page=${currentPage}&limit=${itemsPerPage}`;
  if (searchQuery) {
    url += `&search=${encodeURIComponent(searchQuery)}`;
  }

  try {
    const response = await callApi('get', url, null, {
      Authorization: `Bearer ${token}`,
    });
    return response as ApiResponse;
  } catch (error) {
    console.error('Error fetching holidays:', error);
    throw error;
  }
};

export default function HolidayPage() {
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
    ['holidays', number, number, string]
  >({
    queryKey: ['holidays', currentPage, itemsPerPage, searchQuery],
    queryFn: fetchHolidays,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const holidays = data?.holidays || [];
  const totalItems = data?.totalItems || 0;
  const totalPages = data?.totalPages || 1;

  const [formOpen, setFormOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedHolidayId, setSelectedHolidayId] = useState('');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [deletingHolidayId, setDeletingHolidayId] = useState<string | null>(null);

  const validationSchema = useMemo(() => {
    return Yup.object({
      holiday_name: Yup.string().required('Holiday name is required'),
      date: Yup.date().required('Date is required').typeError('Invalid date format'),
      day: Yup.string().required('Day is required'),
    });
  }, []);

  const formik = useFormik({
    initialValues: {
      holiday_name: '',
      date: '',
      day: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmittingForm(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
      const url = isUpdate ? `${normalizedBaseUrl}holidays/${selectedHolidayId}` : `${normalizedBaseUrl}holidays`;
      const method = isUpdate ? 'put' : 'post';

      try {
        // The API payload uses 'date', 'day', and 'holiday_name', so we just pass values
        const payload = values;

        await callApi(method, url, payload, {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        });

        toast.success(`Holiday ${isUpdate ? 'updated' : 'created'} successfully!`);

        queryClient.invalidateQueries({ queryKey: ['holidays'] });
        setCurrentPage(1);

        setFormOpen(false);
        setIsUpdate(false);
        setSelectedHolidayId('');
        resetForm();
      } catch (error: unknown) {
        const apiError = error as ApiResponseError;
        toast.error(apiError?.response?.data?.detail || 'Something went wrong');
      } finally {
        setIsSubmittingForm(false);
      }
    },
  });

  const handleView = async (holiday: Holiday) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
    try {
      const response = await callApi('get', `${normalizedBaseUrl}holidays/${holiday.id}`, null, {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      });
      const holidayDetails = response as Holiday;
      toast.success(`Viewing: ${holidayDetails.holiday_name} on ${holidayDetails.date} (${holidayDetails.day})`);
    } catch (error: unknown) {
      const apiError = error as ApiResponseError;
      toast.error(apiError?.response?.data?.detail || 'Failed to fetch holiday details');
    }
  };

  const handleUpdate = (holiday: Holiday) => {
    setSelectedHolidayId(holiday.id);
    setIsUpdate(true);
    formik.setValues({
      holiday_name: holiday.holiday_name,
      // Date value must be in 'YYYY-MM-DD' format for input type="date"
      date: holiday.date, 
      day: holiday.day,
    });
    setFormOpen(true);
  };

  const handleDelete = async (holidayId: string) => {
    setDeletingHolidayId(holidayId);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
      await callApi('delete', `${normalizedBaseUrl}holidays/${holidayId}`, null, {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      });

      toast.success('Holiday has been deleted.');
      queryClient.invalidateQueries({ queryKey: ['holidays'] });

      if (holidays.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    } catch (error: unknown) {
      const apiError = error as ApiResponseError;
      toast.error(apiError?.response?.data?.detail || 'Failed to delete holiday');
    } finally {
      setDeletingHolidayId(null);
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
  
  // Determine if the current user is a super_admin or admin
  const canManageHolidays = userRole === 'super_admin' || userRole === 'admin';

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
        <p>Failed to load holidays. Please try again.</p>
        <Button onClick={() => refetch()} label="Retry" variant="primary" className="mt-4" />
      </div>
    );
  }

  if(formOpen){
    return(
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Changed max-w-4xl to max-w-6xl for wider view, matching the main table */}
        <div className="mx-auto mt-10 max-w-6xl rounded bg-white p-6 shadow relative"> 
          {isSubmittingForm && (
            <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-white bg-opacity-80">
              <Loader />
            </div>
          )}
          <h3 className="mb-6 text-2xl font-semibold text-gray-700">
            {isUpdate ? 'Update Holiday' : 'Create Holiday'}
          </h3>
          {/* Reduced space-y-6 to space-y-4 for less gap between form elements */}
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 gap-4"> 
              
              {/* Holiday Name Input Field */}
              <div className="mb-2"> {/* Reduced mb-4 to mb-2 for less gap */}
                <label htmlFor="holiday_name" className="mb-2.5 block text-sm font-medium text-black">
                  Holiday Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="holiday_name"
                    name="holiday_name"
                    placeholder="Enter holiday name"
                    value={formik.values.holiday_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`
                      w-full rounded-lg border py-4 pl-6 pr-12 text-black outline-none transition duration-300
                      ${
                        formik.touched.holiday_name && formik.errors.holiday_name ? 'border-red-500' : 'border-gray-300'
                      }
                      focus:border-purple-600
                    `}
                    disabled={isSubmittingForm}
                  />
                  <FaTag className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                {formik.touched.holiday_name && formik.errors.holiday_name && (
                  <span className="mt-1 block text-sm text-red-500">
                    {formik.errors.holiday_name}
                  </span>
                )}
              </div>

              {/* Date Input Field */}
              <div className="mb-2"> {/* Reduced mb-4 to mb-2 for less gap */}
                <label htmlFor="date" className="mb-2.5 block text-sm font-medium text-black">
                  Date
                </label>
                <div className="relative">
                  <input
                    // Use type="date" to get the native date picker
                    type="date" 
                    id="date"
                    name="date"
                    value={formik.values.date}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`
                      w-full rounded-lg border py-4 pl-6 pr-12 text-black outline-none transition duration-300
                      ${
                        formik.touched.date && formik.errors.date ? 'border-red-500' : 'border-gray-300'
                      }
                      focus:border-purple-600
                      // Ensure text is aligned left
                      text-left
                    `}
                    disabled={isSubmittingForm}
                  />
                  <FaCalendarAlt className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {formik.touched.date && formik.errors.date && (
                  <span className="mt-1 block text-sm text-red-500">
                    {formik.errors.date}
                  </span>
                )}
              </div>

              {/* Day Dropdown (Select Field) */}
              <div className="mb-2"> {/* Reduced mb-4 to mb-2 for less gap */}
                <label htmlFor="day" className="mb-2.5 block text-sm font-medium text-black">
                  Day
                </label>
                <div className="relative">
                  <select
                    id="day"
                    name="day"
                    value={formik.values.day}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`
                      w-full rounded-lg border py-4 pl-6 pr-12 text-black outline-none transition duration-300 appearance-none
                      ${
                        formik.touched.day && formik.errors.day ? 'border-red-500' : 'border-gray-300'
                      }
                      focus:border-purple-600
                    `}
                    disabled={isSubmittingForm}
                  >
                    <option value="" disabled>Select the day</option>
                    {daysOfTheWeek.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  {/* Custom dropdown sign (Chevron Down) */}
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    <FiChevronDown className="h-5 w-5" />
                  </span>
                </div>
                {formik.touched.day && formik.errors.day && (
                  <span className="mt-1 block text-sm text-red-500">
                    {formik.errors.day}
                  </span>
                )}
              </div>
            </div>
            
            {/* Action Buttons: Set to justify-end (right side) */}
            <div className="flex justify-end gap-4 pt-4">
              <Button
                label="Cancel"
                type="button"
                onClick={() => {
                  setFormOpen(false);
                  setIsUpdate(false);
                  setSelectedHolidayId('');
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
    <div className="min-h-screen p-4 bg-gray-100">
      <div className="mx-auto mt-10 max-w-6xl rounded bg-white p-6 shadow">
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-3xl font-bold text-gray-700 sm:text-left">Holiday Management</h2>
          {canManageHolidays && (
            <Button
              label="Add Holiday"
              onClick={() => {
                setFormOpen(true);
                setIsUpdate(false);
                setSelectedHolidayId('');
                formik.resetForm();
              }}
              variant="primary"
              disabled={isSubmittingForm}
              className="w-full sm:w-auto px-4 py-2"
            />
          )}
        </div>

        {/* Search Box for Holidays */}
        <div className="w-full px-4 py-3">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <FiSearch />
            </span>
            <input
              type="text"
              placeholder="Search by holiday name or day..."
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
          <Table
            columns={columns}
            data={holidays}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            {...(canManageHolidays
              ? {
                  actions: (holiday: Holiday) => (
                    <div className="relative flex space-x-2">
                      <ActionButtons
                        onView={() => handleView(holiday)}
                        onUpdate={() => handleUpdate(holiday)}
                        onDelete={() => handleDelete(holiday.id)}
                        showView={true}
                      />
                      {deletingHolidayId === holiday.id && (
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