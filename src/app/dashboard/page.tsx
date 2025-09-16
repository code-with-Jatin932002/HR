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
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

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

// Custom hook to get user role from localStorage
const useUserRole = () => {
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const userRole = sessionStorage.getItem('role_type');
        setRole(userRole);
    }, []);

    return role;
};

// Define the interface for the API response
interface MetricsResponse {
  total_employees: number;
  total_hrs: number;
  pending_leaves: number;
  processed_payrolls: number;
}

export default function DashboardPage() {
  useProtectRoute();
  const { loading } = useAuth();
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;

  // Function to fetch metrics data from the API
  const fetchMetrics = async () => {
    if (!token) {
      toast.error('Authentication token not found. Please log in.');
      throw new Error('Authentication token not found. Please log in.');
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    const responseData = await callApi('get', `${baseUrl}/metrics`, null, {
      Authorization: `Bearer ${token}`,
    });
    return responseData;
  };

  // Use react-query to manage the API call state
  const { data, isLoading, isError } = useQuery<MetricsResponse>({
    queryKey: ['dashboardMetrics'],
    queryFn: fetchMetrics,
    enabled: !!token,
  });

  // Handle loading and error states
  if (loading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-red-500 p-6">
        <p>Failed to load dashboard metrics. Please try again.</p>
      </div>
    );
  }

  // Use the fetched data to create the summary cards
  const summaryCards = data
    ? [
        { title: 'Total Employees', value: data.total_employees, icon: LuUsers, iconColor: 'text-blue-500' },
        { title: 'Activated HR', value: data.total_hrs, icon: LuUserCheck, iconColor: 'text-green-500' },
        { title: 'Pending Leaves', value: data.pending_leaves, icon: LuHourglass, iconColor: 'text-yellow-500' },
        { title: 'Payroll Processed', value: `${data.processed_payrolls}`, icon: LuDollarSign, iconColor: 'text-purple-500' },
      ]
    : [];

  // --- Sample Data for Dashboard (remaining static data) ---

  const recentLeaveRequests = [
    { name: 'Aman Singh', dept: 'HR', from: '2025-05-12', to: '2025-05-14', status: 'Approved' },
    { name: 'Ravi Kumar', dept: 'Dev', from: '2025-05-10', to: '2025-05-12', status: 'Pending' },
    { name: 'Priya Sharma', dept: 'Marketing', from: '2025-05-15', to: '2025-05-15', status: 'Approved' },
    { name: 'Ankit Gupta', dept: 'Sales', from: '2025-05-18', to: '2025-05-20', status: 'Pending' },
    { name: 'Sneha Jain', dept: 'Finance', from: '2025-05-22', to: '2025-05-22', status: 'Approved' },
  ];

  const chatActivity = [
    { name: 'Anjali', text: 'Leave approved ✅', time: '2m ago' },
    { name: 'Rohit', text: 'Payroll done 💸', time: '5m ago' },
    { name: 'Neha', text: 'New job posted 📌', time: '10m ago' },
    { name: 'Vikram', text: 'New employee onboarded 🎉', time: '15m ago' },
    { name: 'Pooja', text: 'Onboarding complete for new hires.', time: '30m ago' },
  ];

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
    '#60A5FA', // blue-400
    '#34D399', // emerald-400
    '#FCD34D', // amber-300
    '#F87171', // red-400
    '#A78BFA', // violet-400
    '#F472B6', // pink-400
    '#9CA3AF'  // gray-400 (if more segments are added)
  ];

  const attendanceData = [
    { id: 'EMP001', name: 'Aman Singh', date: '2025-05-20', status: 'Present', checkIn: '09:00 AM', checkOut: '06:00 PM', hours: '9h' },
    { id: 'EMP002', name: 'Ravi Kumar', date: '2025-05-20', status: 'Present', checkIn: '09:15 AM', checkOut: '06:30 PM', hours: '9h 15m' },
    { id: 'EMP003', name: 'Priya Sharma', date: '2025-05-20', status: 'Absent', checkIn: '-', checkOut: '-', hours: '-' },
    { id: 'EMP004', name: 'Ankit Gupta', date: '2025-05-20', status: 'Present', checkIn: '08:45 AM', checkOut: '05:45 PM', hours: '9h' },
    { id: 'EMP005', name: 'Sneha Jain', date: '2025-05-20', status: 'On Leave', checkIn: '-', checkOut: '-', hours: '-' },
    { id: 'EMP006', name: 'Vivek Sharma', date: '2025-05-20', status: 'Present', checkIn: '09:05 AM', checkOut: '06:05 PM', hours: '9h' },
    { id: 'EMP007', name: 'Kirti Verma', date: '2025-05-20', status: 'Present', checkIn: '09:30 AM', checkOut: '06:00 PM', hours: '8h 30m' },
  ];

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
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

        {/* Charts Section */}
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

        {/* Recent Leave Requests Table and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Recent Leave Requests Table */}
          <div className="bg-white bg-opacity-70 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 lg:col-span-2">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800">Recent Leave Requests</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left border-collapse">
                <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
                  <tr>
                    <th className="px-3 py-3 border-b-2 border-gray-200 whitespace-nowrap">Employee</th>
                    <th className="px-3 py-3 border-b-2 border-gray-200 whitespace-nowrap">Department</th>
                    <th className="px-3 py-3 border-b-2 border-gray-200 whitespace-nowrap">From</th>
                    <th className="px-3 py-3 border-b-2 border-gray-200 whitespace-nowrap">To</th>
                    <th className="px-3 py-3 border-b-2 border-gray-200 text-center whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeaveRequests.map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-3 whitespace-nowrap text-gray-700">{row.name}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-gray-700">{row.dept}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-gray-700">{row.from}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-gray-700">{row.to}</td>
                      <td className="px-3 py-3 whitespace-nowrap text-center">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                            row.status === 'Approved'
                              ? 'bg-green-100 text-green-700'
                              : row.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white bg-opacity-70 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800">Recent Activity</h3>
            <ul className="space-y-5">
              {chatActivity.map((activity, i) => (
                <li key={i} className="flex items-start space-x-3 text-sm">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-400 mt-2.5"></div>
                  <div>
                    <p className="font-semibold text-gray-800">{activity.name}</p>
                    <p className="text-gray-600 mt-0.5">{activity.text}</p>
                  </div>
                  <span className="ml-auto text-xs text-gray-400 pt-0.5">{activity.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Attendance Overview Table (New Section) */}
        <div className="bg-white bg-opacity-70 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 mb-10">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">Attendance Overview</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-3 border-b-2 border-gray-200 whitespace-nowrap">Employee ID</th>
                  <th className="px-3 py-3 border-b-2 border-gray-200 whitespace-nowrap">Employee Name</th>
                  <th className="px-3 py-3 border-b-2 border-gray-200 whitespace-nowrap">Date</th>
                  <th className="px-3 py-3 border-b-2 border-gray-200 text-center whitespace-nowrap">Status</th>
                  <th className="px-3 py-3 border-b-2 border-gray-200 whitespace-nowrap">Check-in</th>
                  <th className="px-3 py-3 border-b-2 border-gray-200 whitespace-nowrap">Check-out</th>
                  <th className="px-3 py-3 border-b-2 border-gray-200 whitespace-nowrap">Total Hours</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((row, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 py-3 whitespace-nowrap text-gray-700">{row.id}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-gray-700">{row.name}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-gray-700">{row.date}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-center">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          row.status === 'Present'
                            ? 'bg-green-100 text-green-700'
                            : row.status === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-gray-700">{row.checkIn}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-gray-700">{row.checkOut}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-gray-700">{row.hours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}