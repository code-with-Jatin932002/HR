'use client';

import useProtectRoute from '@/hooks/useProtectRoute';
import { useAuth } from '@/context/AuthContext';
import { LuUsers, LuUserCheck, LuHourglass, LuDollarSign } from 'react-icons/lu';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import callApi from '@/utils/callApi';
import Loader from '@/components/Loader';
import { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Button from '@/components/Button';

// Define a type for the Pie chart label props to satisfy TypeScript
interface PieLabelRenderProps {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    value?: number;
    percent?: number;
    name?: string;
    payload?: any;
}

// Define the interface for API responses
interface MetricsResponse {
    total_employees: number;
    total_hrs: number;
    pending_leaves: number;
    processed_payrolls: number;
}

interface AttendanceRecord {
    user_name: string;
    user_id: string;
    date: string;
    punch_in: string | null;
    punch_out: string | null;
    work_hours: string;
    status: 'Present' | 'Absent' | 'On Leave' | 'Holiday';
}

interface AttendanceApiWrapper {
    data: AttendanceRecord[];
    // ... other pagination fields
}
type AttendanceResponse = AttendanceRecord[];

// Define status types
type LeaveStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | '-------------';

interface LeaveRecord {
    id: string;
    user_id: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    description: string;
    // Status fields from the API
    hr_status: LeaveStatus; 
    manager_status: LeaveStatus;
    status: LeaveStatus; // This is the Overall Status
    created_at: string;
}

interface LeavesApiWrapper {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    leaves: LeaveRecord[]; // Array of leave records
}
// 🌟 CORRECTION: Ensure LeavesResponse uses the LeaveRecord array type.
type LeavesResponse = LeaveRecord[];

// --- Utility Functions ---

const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getBaseUrl = () => {
    const url = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
    return url.endsWith('/') ? url.slice(0, -1) : url;
};

/**
 * Returns a Tailwind class string for status colors.
 * @param status The status string.
 * @returns Tailwind class string.
 */
const getStatusColor = (status: LeaveStatus | string) => {
    switch (status) {
        case 'ACCEPTED':
            return 'bg-green-100 text-green-700';
        case 'REJECTED':
            return 'bg-red-100 text-red-700';
        case 'PENDING':
            return 'bg-yellow-100 text-yellow-700';
        default: // '-------------', null, or other pending-like statuses
            return 'bg-blue-100 text-blue-700';
    }
}

// --- Dashboard Component ---

export default function DashboardPage() {
    useProtectRoute();
    const { loading } = useAuth();
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;
    const baseUrl = getBaseUrl();
    const todayDate = getTodayDate();

    // 1. Function to fetch metrics data
    const fetchMetrics = async () => {
        if (!token) throw new Error('Authentication token not found.');
        const responseData = await callApi('get', `${baseUrl}/metrics`, null, {
            Authorization: `Bearer ${token}`,
        });
        return responseData;
    };

    // 2. Function to fetch today's attendance data
    const fetchAttendance = async (): Promise<AttendanceResponse> => {
        if (!token) throw new Error('Authentication token not found.');
        const url = `${baseUrl}/time-tracker/attendance/all?report_date=${todayDate}&page=1&limit=7`; 
        const response: AttendanceApiWrapper | AttendanceRecord[] = await callApi('get', url, null, {
            Authorization: `Bearer ${token}`,
        });
        return (response as AttendanceApiWrapper).data || (response as AttendanceRecord[]);
    };

    // 3. Function to fetch recent leave requests (Dynamic)
    const fetchLeaves = async (): Promise<LeavesResponse> => {
        if (!token) throw new Error('Authentication token not found.');
        
        // 🌟 KEY CHANGE: Using 'created_at' and 'desc' to get the most recent leaves first.
        const url = `${baseUrl}/leaves?page=1&limit=10&sort_by=created_at&order_by=desc`; 
        
        const response: LeavesApiWrapper = await callApi('get', url, null, {
            Authorization: `Bearer ${token}`,
        });
        
        // The API returns the leaves inside the 'leaves' property of the wrapper object.
        return response.leaves;
    };

    // Use react-query to manage the API calls
    const { 
        data: metricsData, 
        isLoading: isMetricsLoading, 
        isError: isMetricsError,
        refetch: refetchMetrics
    } = useQuery<MetricsResponse>({ queryKey: ['dashboardMetrics'], queryFn: fetchMetrics, enabled: !!token });

    const { 
        data: attendanceData, 
        isLoading: isAttendanceLoading, 
        isError: isAttendanceError,
        refetch: refetchAttendance
    } = useQuery<AttendanceResponse>({ queryKey: ['todayAttendance'], queryFn: fetchAttendance, enabled: !!token, staleTime: 60 * 1000 });

    const { 
        data: leaveRequestsData, 
        isLoading: isLeavesLoading, 
        isError: isLeavesError,
        refetch: refetchLeaves
    } = useQuery<LeavesResponse>({ 
        queryKey: ['recentLeaves'], 
        queryFn: fetchLeaves, 
        enabled: !!token, 
        staleTime: 5 * 60 * 1000 // Cache data for 5 minutes
    });

    // Handle combined loading and error state
    if (loading || isMetricsLoading || isAttendanceLoading || isLeavesLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (isMetricsError || isAttendanceError || isLeavesError) {
        if (isLeavesError) toast.error('Failed to load recent leave requests.');
        return (
            <div className="flex h-full flex-col items-center justify-center text-red-500 p-6">
                <p className='text-xl font-semibold mb-4'>❌ Failed to load dashboard data.</p>
                <p className='text-gray-600'>An error occurred while fetching data. Please ensure the API is running and your token is valid.</p>
                <Button onClick={() => { refetchMetrics(); refetchAttendance(); refetchLeaves(); }} variant="primary" className="mt-6">
                    Retry Loading Dashboard
                </Button>
            </div>
        );
    }

    // Prepare data for rendering
    const summaryCards = metricsData
        ? [
            { title: 'Total Employees', value: metricsData.total_employees, icon: LuUsers, iconColor: 'text-blue-500' },
            { title: 'Activated HR', value: metricsData.total_hrs, icon: LuUserCheck, iconColor: 'text-green-500' },
            { title: 'Pending Leaves', value: metricsData.pending_leaves, icon: LuHourglass, iconColor: 'text-yellow-500' },
            { title: 'Payroll Processed', value: `${metricsData.processed_payrolls}`, icon: LuDollarSign, iconColor: 'text-purple-500' },
        ]
        : [];

    const dashboardAttendanceData = attendanceData || [];
    // 🌟 RECENT LEAVES DATA: This now holds the array of the 10 most recent leave requests.
    const recentLeaveRequests = leaveRequestsData || [];

    // --- Static Data for Charts (Kept static) ---
    const employeeDistributionData = [
        { name: 'Development', employees: 120 },
        { name: 'HR', employees: 30 },
        { name: 'Marketing', employees: 50 },
        { name: 'Sales', employees: 70 },
        { name: 'Finance', employees: 40 },
        { name: 'Support', employees: 30 },
    ];

    const leaveTrendsData = [
        { month: 'Jan', approved: 10, pending: 2, rejected: 1 },
        { month: 'Feb', approved: 15, pending: 3, rejected: 0 },
        { month: 'Mar', approved: 12, pending: 1, rejected: 2 },
        { month: 'Apr', approved: 18, pending: 4, rejected: 1 },
        { month: 'May', approved: 20, pending: 5, rejected: 2 },
    ];

    const PIE_COLORS = [
        '#60A5FA', '#34D399', '#FCD34D', '#F87171', '#A78BFA', '#F472B6', '#9CA3AF' 
    ];


    return (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-white min-h-screen">
            <Toaster position="top-center" reverseOrder={false} />
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
                
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-2">Welcome to your Dashboard</h1>
                    <p className="text-gray-600 text-lg">
                        Manage your HR operations efficiently.
                    </p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {summaryCards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={index}
                                className="bg-white bg-opacity-70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200 flex items-center space-x-4 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                            >
                                <div className={`flex-shrink-0 p-3 rounded-full ${card.iconColor} bg-opacity-20`}>
                                    <Icon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-medium text-gray-600">{card.title}</h4>
                                    <p className="text-3xl font-bold text-gray-800 mt-1">{card.value}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ------------------- */}
                {/* --- Charts Section --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                    {/* Employee Distribution Chart (Pie Chart) */}
                    <div className="bg-white bg-opacity-70 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 h-80 sm:h-96 flex flex-col justify-center items-center">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 text-center">Employee Distribution by Department</h3>
                        <ResponsiveContainer width="100%" height="80%">
                            <PieChart>
                                <Pie
                                    data={employeeDistributionData}
                                    dataKey="employees"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ name, percent }: PieLabelRenderProps) =>
                                        `${name || 'N/A'} (${((percent || 0) * 100).toFixed(0)}%)`
                                    }
                                >
                                    {employeeDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Leave Trends Chart (Bar Chart) */}
                    <div className="bg-white bg-opacity-70 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 h-80 sm:h-96 flex flex-col justify-center items-center">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 text-center">Monthly Leave Trends</h3>
                        <ResponsiveContainer width="100%" height="80%">
                            <BarChart
                                data={leaveTrendsData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="approved" stackId="a" fill="#4CAF50" name="Approved" />
                                <Bar dataKey="pending" stackId="a" fill="#FFC107" name="Pending" />
                                <Bar dataKey="rejected" stackId="a" fill="#F44336" name="Rejected" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ------------------- */}
                {/* 🌟 Recent Leave Requests (Dynamic) - This section is ready to show the newest leaves 🌟 */}
                <div className="bg-white bg-opacity-70 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 mb-10">
                    <h3 className="text-2xl font-semibold mb-6 text-gray-800">Recent Leave Requests </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left border-collapse">
                            <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
                                <tr>
                                    <th className="px-3 py-3 border-b-2 border-gray-200 whitespace-nowrap">Leave Type</th>
                                    <th className="px-3 py-3 border-b-2 border-gray-200 whitespace-nowrap">Start Date</th>
                                    <th className="px-3 py-3 border-b-2 border-gray-200 whitespace-nowrap">End Date</th>
                                    <th className="px-3 py-3 border-b-2 border-gray-200 text-center whitespace-nowrap">Manager Status</th>
                                    <th className="px-3 py-3 border-b-2 border-gray-200 text-center whitespace-nowrap">HR Status</th>
                                    <th className="px-3 py-3 border-b-2 border-gray-200 text-center whitespace-nowrap">Overall Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentLeaveRequests.length > 0 ? (
                                    recentLeaveRequests.map((row) => {
                                        // The final 'status' field from the API is used here
                                        const overallStatusColor = getStatusColor(row.status);
                                        
                                        return (
                                            <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="px-3 py-3 whitespace-nowrap text-gray-700 capitalize">{row.leave_type}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-gray-700">{row.start_date}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-gray-700">{row.end_date}</td>
                                                
                                                {/* Manager Status */}
                                                <td className="px-3 py-3 whitespace-nowrap text-center">
                                                    <span
                                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(row.manager_status)}`}
                                                    >
                                                        {row.manager_status}
                                                    </span>
                                                </td>

                                                {/* HR Status */}
                                                <td className="px-3 py-3 whitespace-nowrap text-center">
                                                    <span
                                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(row.hr_status)}`}
                                                    >
                                                        {row.hr_status}
                                                    </span>
                                                </td>
                                                
                                                {/* Overall Status */}
                                                <td className="px-3 py-3 whitespace-nowrap text-center">
                                                    <span
                                                        className={`px-3 py-1.5 rounded-full text-xs font-bold ${overallStatusColor}`}
                                                    >
                                                        {row.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        {/* Adjusted colspan to 6 (Leave Type, Start, End, Manager, HR, Overall) */}
                                        <td colSpan={6} className="px-3 py-5 text-center text-gray-500">
                                            No recent leave requests found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* ------------------- */}
                {/* --- Attendance Overview Table (Dynamic) --- */}
                <div className="bg-white bg-opacity-70 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 mb-10">
                    <h3 className="text-2xl font-semibold mb-6 text-gray-800">Today's Attendance Overview ({todayDate})</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left border-collapse">
                            <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
                                <tr>
                                    <th className="px-3 py-3 border-b-2 border-gray-200 whitespace-nowrap">Employee Name</th>
                                    <th className="px-3 py-3 border-b-2 border-gray-200 text-center whitespace-nowrap">Status</th>
                                    <th className="px-3 py-3 border-b-2 border-gray-200 whitespace-nowrap">Check-in</th>
                                    <th className="px-3 py-3 border-b-2 border-gray-200 whitespace-nowrap">Check-out</th>
                                    <th className="px-3 py-3 border-b-2 border-gray-200 whitespace-nowrap">Work Hours</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardAttendanceData.length > 0 ? (
                                    dashboardAttendanceData.map((row) => {
                                        let statusColor = 'bg-gray-100 text-gray-700';
                                        switch (row.status) {
                                            case 'Present':
                                                statusColor = 'bg-green-100 text-green-700';
                                                break;
                                            case 'Absent':
                                                statusColor = 'bg-red-100 text-red-700';
                                                break;
                                            default:
                                                statusColor = 'bg-blue-100 text-blue-700';
                                                break;
                                        }

                                        return (
                                            <tr key={row.user_id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="px-3 py-3 whitespace-nowrap text-gray-700">{row.user_name}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-center">
                                                    <span
                                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${statusColor}`}
                                                    >
                                                        {row.status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 whitespace-nowrap text-gray-700">{row.punch_in || '-'}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-gray-700">{row.punch_out || '-'}</td>
                                                <td className="px-3 py-3 whitespace-nowrap text-gray-700">{row.work_hours || '-'}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-3 py-5 text-center text-gray-500">
                                            No attendance records found for today ({todayDate}).
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}