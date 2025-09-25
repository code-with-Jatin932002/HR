'use client';
import { useQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { FiCalendar } from 'react-icons/fi';

import callApi from '@/utils/callApi';
import useAuthRedirect from '@/hooks/useAuthRedirect';
import useProtectRoute from '@/hooks/useProtectRoute';
import Table from '@/components/Table';
import Loader from '@/components/Loader';
import Button from '@/components/Button';
import Pagination from '@/components/Pagination';

// Define the interface for the attendance data
interface AttendanceRecord {
  user_name: string;
  user_id: string;
  date: string;
  punch_in: string | null;
  punch_out: string | null;
  work_hours: string;
  break_hours: string;
  status: 'Present' | 'Absent';
}

// The API response structure
interface ApiResponse {
  data: AttendanceRecord[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// Utility function to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Define columns for the table with conditional rendering
const columns = [
  { label: 'Employee Name', key: 'user_name' },
  { label: 'Punch In', key: 'punch_in' },
  { label: 'Punch Out', key: 'punch_out' },
  { label: 'Work Hours', key: 'work_hours' },
  { label: 'Break Hours', key: 'break_hours' },
  {
    label: 'Status',
    key: 'status',
    // Add the render function to display a colored status pill
    render: (item: AttendanceRecord) => {
      const status = item.status;
      const statusColor = status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
      return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
          {status}
        </span>
      );
    },
  },
];

// Data fetching function for react-query, with explicit type annotations
const fetchAttendance = async ({
  queryKey,
}: {
  queryKey: [string, string, number, number];
}) => {
  const [_key, reportDate, currentPage, itemsPerPage] = queryKey;
  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found.');
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;

  let url = `${normalizedBaseUrl}time-tracker/attendance/all?report_date=${reportDate}&page=${currentPage}&limit=${itemsPerPage}`;

  try {
    const response = await callApi('get', url, null, {
      Authorization: `Bearer ${token}`,
    });
    return {
      data: response,
      totalItems: response.length,
      totalPages: 1,
      currentPage: 1,
      pageSize: response.length,
    } as ApiResponse;
  } catch (error) {
    console.error('Error fetching attendance:', error);
    throw error;
  }
};

export default function AttendancePage() {
  useAuthRedirect();
  useProtectRoute();

  const [reportDate, setReportDate] = useState<string>(getTodayDate());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { data, isLoading, isError, refetch } = useQuery<
    ApiResponse,
    Error,
    ApiResponse,
    [string, string, number, number]
  >({
    queryKey: ['attendance', reportDate, currentPage, itemsPerPage],
    queryFn: fetchAttendance,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const attendanceData = data?.data || [];
  const totalItems = data?.totalItems || 0;
  const totalPages = data?.totalPages || 1;

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReportDate(e.target.value);
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
        <p>Failed to load attendance data. Please try again.</p>
        <Button onClick={() => refetch()} label="Retry" variant="primary" className="mt-4" />
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mx-auto mt-10 w-290 rounded bg-white p-6 shadow">
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-700 sm:text-left">Attendance Tracker</h2>
          <div className="relative">
            <input
              type="date"
              value={reportDate}
              onChange={handleDateChange}
              className="pl-10 pr-4 py-2 border text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <FiCalendar />
            </span>
          </div>
        </div>

        <div>
          <Table
            columns={columns}
            data={attendanceData}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
          />
        </div>

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
  );
}