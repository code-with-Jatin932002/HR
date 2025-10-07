'use client';
import { useQuery, QueryFunctionContext } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { FiCalendar, FiDownload } from 'react-icons/fi';

import callApi from '@/utils/callApi';
import useAuthRedirect from '@/hooks/useAuthRedirect';
import useProtectRoute from '@/hooks/useProtectRoute';
import Table from '@/components/Table';
import Loader from '@/components/Loader';
import Button from '@/components/Button';
import Pagination from '@/components/Pagination';

// Define the type for the attendance status filter
type AttendanceStatus = 'All' | 'Present' | 'Absent';

// --- Type Definitions (No Change) ---
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

interface ApiResponse {
  data: AttendanceRecord[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

type AttendanceQueryKey = ['attendance', string, number, number, AttendanceStatus];

// --- Utility Functions (No Change) ---

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/';
  return baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
};

// --- Table Configuration (No Change) ---

const columns = [
  { label: 'Employee Name', key: 'user_name' },
  { label: 'Punch In', key: 'punch_in' },
  { label: 'Punch Out', key: 'punch_out' },
  { label: 'Work Hours', key: 'work_hours' },
  { label: 'Break Hours', key: 'break_hours' },
  {
    label: 'Status',
    key: 'status',
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

// --- Data Fetching Function (No Change) ---

const fetchAttendance = async ({
  queryKey,
}: QueryFunctionContext<AttendanceQueryKey>): Promise<ApiResponse> => {
  const [_key, reportDate, currentPage, itemsPerPage, statusFilter] = queryKey;
  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('No authentication token found.');
  }

  const normalizedBaseUrl = getBaseUrl();
  let url = `${normalizedBaseUrl}time-tracker/attendance/all?report_date=${reportDate}&page=${currentPage}&limit=${itemsPerPage}`;

  if (statusFilter !== 'All') {
    url += `&status=${statusFilter}`;
  }

  try {
    const response = await callApi('get', url, null, {
      Authorization: `Bearer ${token}`,
    });

    if (Array.isArray(response)) {
        return {
          data: response,
          totalItems: response.length,
          totalPages: 1,
          currentPage: 1,
          pageSize: response.length,
        } as ApiResponse;
    }

    return response as ApiResponse;
  } catch (error) {
    console.error('Error fetching attendance:', error);
    toast.error('Failed to load attendance data.');
    throw error;
  }
};

// --- Component ---

export default function AttendancePage() {
  useAuthRedirect();
  useProtectRoute();

  const [reportDate, setReportDate] = useState<string>(getTodayDate());
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isDownloading, setIsDownloading] = useState(false);

  const queryKey: AttendanceQueryKey = useMemo(() => 
    ['attendance', reportDate, currentPage, itemsPerPage, statusFilter], 
    [reportDate, currentPage, itemsPerPage, statusFilter]
  );

  const { data, isLoading, isError, refetch } = useQuery<
    ApiResponse, 
    Error, 
    ApiResponse, 
    AttendanceQueryKey 
  >({
    queryKey: queryKey,
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
  
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as AttendanceStatus);
    setCurrentPage(1);
  };
  
  const handleDownloadExcel = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Authentication token missing. Please log in.');
      return;
    }

    setIsDownloading(true);
    try {
      const normalizedBaseUrl = getBaseUrl();
      let url = `${normalizedBaseUrl}time-tracker/attendance/all/download/excel?report_date=${reportDate}`;
      
      if (statusFilter !== 'All') {
        url += `&status=${statusFilter}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to download Excel file.';
        if (contentType && contentType.includes('application/json')) {
            const errorBody = await response.json();
            errorMessage = errorBody.message || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition && contentDisposition.match(/filename="?(.+?)"?$/i);
      const filename = filenameMatch ? filenameMatch[1] : `Attendance_Report_${reportDate}_${statusFilter}.xlsx`;

      const blob = await response.blob();
      
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(urlBlob);
      
      toast.success('Excel download started successfully!');
    } catch (error: any) {
      console.error('Error downloading attendance Excel:', error);
      toast.error(error.message || 'Failed to download Excel file.');
    } finally {
      setIsDownloading(false);
    }
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
      <div className="mx-auto mt-10 w-full max-w-7xl rounded bg-white p-6 shadow">
        {/* Header and Controls */}
        {/* The main header flex container retains its 'sm:flex-row' for desktop layout */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-gray-700 sm:text-left">Attendance Tracker</h2>
          
          {/* FIX: Removed 'sm:' prefixes for flex-row and w-auto.
            Now it defaults to 'flex-col w-full' (stacking) on mobile/small screens (e.g., 978px).
            It only switches to 'flex-row w-auto' (horizontal) at the 'lg' breakpoint (1024px).
          */}
          <div className="flex flex-col gap-3 w-full lg:flex-row lg:items-center lg:w-auto">
            
            {/* Date Picker */}
            <div className="relative w-full lg:w-auto">
              <input
                type="date"
                value={reportDate}
                onChange={handleDateChange}
                // w-full on small screens, lg:w-auto on large screens
                className="pl-10 pr-4 py-2 border text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300 w-full lg:w-auto"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <FiCalendar />
              </span>
            </div>
            
            {/* Status Filter Dropdown */}
            <select
                value={statusFilter}
                onChange={handleStatusChange}
                // w-full on small screens, lg:w-auto on large screens
                className="py-2 px-3 border text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300 w-full lg:w-auto"
            >
                <option value="All">All Status</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
            </select>

            {/* Download Button */}
            <Button
                onClick={handleDownloadExcel}
                variant="primary" 
                // w-full on small screens, lg:w-auto on large screens
                className="flex items-center justify-center w-full lg:w-auto" 
                disabled={isDownloading}
            >
                <FiDownload className="mr-2 h-4 w-4" />
                {isDownloading ? 'Downloading...' : 'Download Excel'}
            </Button>
          </div>
        </div>

        {/* Table (No Change) */}
        <div>
          <Table
            columns={columns}
            data={attendanceData}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
          />
        </div>

        {/* Pagination and Summary (No Change) */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
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