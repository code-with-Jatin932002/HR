'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import callApi from '@/utils/callApi';
import { toast } from 'react-hot-toast';
import { format, isValid, parseISO, differenceInSeconds, startOfWeek } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { FiDownload } from 'react-icons/fi';

import { useAuth } from '@/context/AuthContext';
import { useTimeTracker } from '@/context/TimeTrackerContext';
import Loader from '@/components/Loader';
import Button from '@/components/Button';
import ReportTable from '@/components/ReportTable';

// --- Type Definitions (Kept the same) ---
interface TimeTrackerData {
  user_id: string;
  punch_in: string | null;
  punch_out: string | null;
  duration: string | null;
  activity: string | null;
  break_start: string | null;
  total_break_duration: string | null;
  resume_time: string | null;
  id: string;
  created_at: string;
  updated_at: string;
}

interface DailyReport {
  user_id: string;
  date: string;
  records: {
    punch_in: string;
    punch_out: string;
    work_hours: string;
    break_hours: string;
  }[];
  total_work_hours: string;
  total_break_hours: string;
  attendance_status: string;
}

interface WeeklyReport {
  start_date: string;
  end_date: string;
  weekly_summary: {
    [date: string]: {
      date: string;
      punch_in: string | null;
      punch_out: string | null;
      work_hours: string;
      break_hours: string;
      status: string;
    };
  };
  total_work_hours_weekly: string;
  total_break_hours_weekly: string;
  attendance_percentage: string;
}

// --- API Fetching Functions (No Change) ---

const getBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

const fetchDailyReport = async (reportDate: string) => {
  const token = sessionStorage.getItem('token');
  if (!token) throw new Error('No authentication token found.');
  const url = `${getBaseUrl()}/time-tracker/reports/daily?report_date=${reportDate}`;
  return callApi('get', url, null, { Authorization: `Bearer ${token}` });
};

const fetchWeeklyReport = async (startDate: string) => {
  const token = sessionStorage.getItem('token');
  if (!token) throw new Error('No authentication token found.');
  const url = `${getBaseUrl()}/time-tracker/reports/weekly?start_date=${startDate}`;
  return callApi('get', url, null, { Authorization: `Bearer ${token}` });
};

// --- Component ---

const AttendancePage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const {
    timeTrackerStatus,
    currentStatus,
    loadingTimeTracker,
    updateTimeTrackerStatus,
    updateAttendanceStatus,
  } = useTimeTracker();

  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [isDownloadingDaily, setIsDownloadingDaily] = useState(false); // 🛑 NEW STATE
  const [isDownloadingWeekly, setIsDownloadingWeekly] = useState(false); // 🛑 NEW STATE
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [showDailyReport, setShowDailyReport] = useState(false);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [reportDate, setReportDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: dailyReport, isLoading: isLoadingDaily } = useQuery<DailyReport>({
    queryKey: ['dailyReport', reportDate],
    queryFn: () => fetchDailyReport(reportDate),
    enabled: showDailyReport,
  });

  const { data: weeklyReport, isLoading: isLoadingWeekly } = useQuery<WeeklyReport>({
    queryKey: ['weeklyReport', reportDate],
    queryFn: () => {
      // API expects start_date, calculating it from reportDate
      const startOfWeekDate = format(startOfWeek(parseISO(reportDate), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      return fetchWeeklyReport(startOfWeekDate);
    },
    enabled: showWeeklyReport,
  });

  const ACTION_API_PATH = '/time-tracker/toggle';

  // --- Utility: Time Calculations (No Change) ---
  const calculateElapsedTime = useCallback(() => {
    // ... (Existing calculateElapsedTime logic)
    if (!timeTrackerStatus || !timeTrackerStatus.punch_in || timeTrackerStatus.punch_out) {
      setElapsedSeconds(0);
      return;
    }

    const punchInTime = parseISO(timeTrackerStatus.punch_in);
    const now = new Date();

    if (!isValid(punchInTime)) {
      setElapsedSeconds(0);
      return;
    }

    let totalActiveSeconds = differenceInSeconds(now, punchInTime);
    let totalBreakSeconds = 0;

    const breakDuration = timeTrackerStatus.total_break_duration;
    if (breakDuration && /^\d{2}:\d{2}:\d{2}$/.test(breakDuration)) {
      const [hours, minutes, seconds] = breakDuration.split(':').map(Number);
      totalBreakSeconds = hours * 3600 + minutes * 60 + seconds;
    }

    if (timeTrackerStatus.break_start && !timeTrackerStatus.resume_time) {
      const breakStartTime = parseISO(timeTrackerStatus.break_start);
      if (isValid(breakStartTime)) {
        totalBreakSeconds += differenceInSeconds(now, breakStartTime);
      }
    }

    setElapsedSeconds(Math.max(0, totalActiveSeconds - totalBreakSeconds));
  }, [timeTrackerStatus]);

  useEffect(() => {
    // ... (Existing useEffect logic for timer)
    if (currentStatus === 'punchedIn') {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      timerIntervalRef.current = setInterval(() => {
        calculateElapsedTime();
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (currentStatus === 'punchedOut' || currentStatus === 'notStarted') {
        setElapsedSeconds(0);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [currentStatus, calculateElapsedTime]);

  const formatElapsedTime = (totalSeconds: number) => {
    // ... (Existing formatElapsedTime logic)
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map(unit => String(unit).padStart(2, '0'))
      .join(':');
  };

  // --- Time Tracker Actions (No Change) ---

  const handleTimeTrackerAction = async (actionType: 'toggle' | 'break' | 'punchout') => {
    // ... (Existing handleTimeTrackerAction logic)
    setIsLoadingAction(true);
    try {
      const response: TimeTrackerData = await callApi('POST', `${ACTION_API_PATH}?action=${actionType}`);
      updateTimeTrackerStatus(response);
      updateAttendanceStatus(response);

      let successMessage = '';
      if (actionType === 'toggle') {
        successMessage = 'Successfully punched in!';
      } else if (actionType === 'break') {
        if (response.break_start && !response.resume_time) {
          successMessage = 'Successfully started break!';
        } else {
          successMessage = 'Successfully resumed work!';
        }
      } else if (actionType === 'punchout') {
        successMessage = 'Successfully punched out!';
      }
      toast.success(successMessage);
    } catch (error: any) {
      console.error(`Error performing ${actionType} action:`, error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || `Failed to ${actionType}.`;
      toast.error(errorMessage);
    } finally {
      setIsLoadingAction(false);
    }
  };

  const formatDuration = (duration: string | null) => {
    // ... (Existing formatDuration logic)
    if (!duration) return '00:00:00';
    if (duration.startsWith('-')) {
      return '00:00:00';
    }
    if (/^\d{2}:\d{2}:\d{2}$/.test(duration)) {
      return duration;
    }
    return 'N/A';
  };

  const formatDateTime = (isoString: string | null) => {
    // ... (Existing formatDateTime logic)
    if (!isoString) return 'N/A';
    const date = parseISO(isoString);
    return isValid(date) ? format(date, 'MMM dd, yyyy HH:mm:ss') : 'Invalid Date';
  };

  // --- 🛑 NEW: API Download Functions 🛑 ---

  const handleDownloadReport = useCallback(async (reportType: 'daily' | 'weekly') => {
    let url = '';
    let reportName = '';
    
    // Determine the API URL and report name based on the type
    if (reportType === 'daily') {
      setIsDownloadingDaily(true);
      url = `${getBaseUrl()}/time-tracker/reports/daily/download/excel?report_date=${reportDate}`;
      reportName = `daily_report_${reportDate}`;
    } else { // weekly
      setIsDownloadingWeekly(true);
      const startOfWeekDate = format(startOfWeek(parseISO(reportDate), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      url = `${getBaseUrl()}/time-tracker/reports/weekly/download/excel?start_date=${startOfWeekDate}`;
      reportName = `weekly_report_starting_${startOfWeekDate}`;
    }

    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Authentication token missing. Please log in.');
      setIsDownloadingDaily(false);
      setIsDownloadingWeekly(false);
      return;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorBody = await response.json();
        const errorMessage = errorBody.message || `Failed to download ${reportType} report.`;
        throw new Error(errorMessage);
      }

      // Handle the file download (Blob)
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition && contentDisposition.match(/filename="?(.+?)"?$/i);
      const filename = filenameMatch ? filenameMatch[1] : `${reportName}.xlsx`;

      const blob = await response.blob();
      
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(urlBlob);
      
      toast.success(`${reportType} report downloaded successfully!`);
    } catch (error: any) {
      console.error(`Error downloading ${reportType} report:`, error);
      toast.error(error.message || `Failed to download ${reportType} report.`);
    } finally {
      setIsDownloadingDaily(false);
      setIsDownloadingWeekly(false);
    }
  }, [reportDate]); // Dependency on reportDate to ensure correct date is used

  // --- End of NEW: API Download Functions ---
  
  // 🛑 Removed old downloadDailyReport and downloadWeeklyReport functions 🛑

  // --- Render Logic (No Change) ---
  if (authLoading || loadingTimeTracker) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 text-center text-gray-600">
        Please log in to view the time tracker.
      </div>
    );
  }

  const renderStatus = (status: string) => {
    const statusColor = status === 'Present' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6 lg:px-8">
      {/* Current Session Block (No Change) */}
      <div className={`bg-white shadow-2xl rounded-2xl p-8 mb-10 border border-gray-100 transform transition-transform duration-300 hover:scale-[1.005]
        ${currentStatus === 'notStarted' ? 'bg-[url(/images/pattern-dots.svg)] bg-repeat-x bg-[bottom_left] md:bg-repeat-round' : ''}
      `}>
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-700">Current Session</h2>

        <div className="flex justify-center mb-8">
          {/* ... (Your current status rendering circles) ... */}
          {currentStatus === 'punchedIn' && (
            <div className="relative inline-flex items-center justify-center w-64 h-64 rounded-full bg-gradient-to-br from-green-500 to-teal-600 shadow-xl animate-pulse-slow">
              <div className="absolute inset-0 rounded-full border-8 border-white border-opacity-30"></div>
              <div className="text-white">
                <p className="text-2xl font-medium">Working For</p>
                <p className="text-4xl font-extrabold tracking-wider mt-1">{formatElapsedTime(elapsedSeconds)}</p>
              </div>
            </div>
          )}
          {currentStatus === 'onBreak' && (
            <div className="relative inline-flex items-center justify-center w-64 h-64 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 shadow-xl animate-pulse-slow">
              <div className="absolute inset-0 rounded-full border-8 border-white border-opacity-30"></div>
              <div className="text-white">
                <p className="text-2xl font-medium">On Break</p>
                <p className="text-4xl font-extrabold tracking-wider mt-1">--:--:--</p>
              </div>
            </div>
          )}
          {currentStatus === 'punchedOut' && (
            <div className="relative inline-flex items-center justify-center w-64 h-64 rounded-full bg-gradient-to-br from-red-500 to-pink-600 shadow-xl">
              <div className="absolute inset-0 rounded-full border-8 border-white border-opacity-30"></div>
              <div className="text-white">
                <p className="text-2xl font-medium">Session Ended</p>
                <p className="text-4xl font-extrabold tracking-wider mt-1">--:--:--</p>
              </div>
            </div>
          )}
          {currentStatus === 'notStarted' && (
            <div className="relative inline-flex items-center justify-center w-64 h-64 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl">
              <div className="absolute inset-0 rounded-full border-8 border-white border-opacity-30"></div>
              <div className="text-white p-4">
                <p className="text-2xl font-semibold mb-2">Ready to start</p>
                <p className="text-4xl font-extrabold tracking-wider mt-4">00:00:00</p>
              </div>
            </div>
          )}
        </div>

        {timeTrackerStatus && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-700 text-lg">
            {/* ... (Your current session details) ... */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
              <strong>Punch In:</strong> <span className="block text-gray-800 font-medium mt-1">{formatDateTime(timeTrackerStatus.punch_in)}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
              <strong>Punch Out:</strong> <span className="block text-gray-800 font-medium mt-1">{formatDateTime(timeTrackerStatus.punch_out)}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
              <strong>Break Start:</strong> <span className="block text-gray-800 font-medium mt-1">{formatDateTime(timeTrackerStatus.break_start)}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
              <strong>Resume Time:</strong> <span className="block text-gray-800 font-medium mt-1">{formatDateTime(timeTrackerStatus.resume_time)}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
              <strong>Total Work Duration:</strong> <span className="block text-gray-800 font-medium mt-1">{formatDuration(timeTrackerStatus.duration)}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
              <strong>Total Break Duration:</strong> <span className="block text-gray-800 font-medium mt-1">{formatDuration(timeTrackerStatus.total_break_duration)}</span>
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-6">
          {/* ... (Your action buttons: Punch In, Start Break, Punch Out) ... */}
          {currentStatus === 'notStarted' && (
            <Button
              label="Punch In"
              onClick={() => handleTimeTrackerAction('toggle')}
              variant="primary"
              disabled={isLoadingAction}
            />
          )}

          {currentStatus === 'punchedIn' && (
            <>
              <Button
                label="Start Break"
                onClick={() => handleTimeTrackerAction('break')}
                variant="success"
                disabled={isLoadingAction}
              />
              <Button
                label="Punch Out"
                onClick={() => handleTimeTrackerAction('punchout')}
                variant="danger"
                disabled={isLoadingAction}
              />
            </>
          )}

          {currentStatus === 'onBreak' && (
            <Button
              label="End Break / Resume Work"
              onClick={() => handleTimeTrackerAction('break')}
              disabled={isLoadingAction}
            />
          )}
        </div>
      </div>

      {/* Reports Block (Updated Download Buttons) */}
      <div className="bg-white shadow-2xl rounded-2xl p-8 mb-10 border border-gray-100">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-700">My Reports</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6">
          <label htmlFor="reportDate" className="font-semibold text-gray-700">Select Date:</label>
          <input
            id="reportDate"
            type="date"
            value={reportDate}
            onChange={(e) => {
              setReportDate(e.target.value);
              setShowDailyReport(false);
              setShowWeeklyReport(false);
            }}
            className="p-2 border rounded-md text-gray-600"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            label="Daily Report"
            onClick={() => {
              setShowDailyReport(true);
              setShowWeeklyReport(false);
            }}
            variant="primary"
            disabled={isLoadingDaily}
          />
          <Button
            label="Weekly Report"
            onClick={() => {
              setShowWeeklyReport(true);
              setShowDailyReport(false);
            }}
            variant="secondary"
            disabled={isLoadingWeekly}
          />
        </div>

        {showDailyReport && (
          <div className="mt-8 border p-4 rounded-lg bg-gray-50">
            <h3 className="text-xl font-bold mb-4 text-gray-700">Daily Report for {dailyReport?.date}</h3>
            {isLoadingDaily && <Loader />}
            {dailyReport && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                  <p className="text-md text-gray-600">
                    <strong>Total Work Hours:</strong> {dailyReport.total_work_hours} | 
                    <strong> Total Break Hours:</strong> {dailyReport.total_break_hours} | 
                    <strong> Status:</strong> <span className={`font-semibold ${dailyReport.attendance_status === 'Present' ? 'text-green-600' : 'text-red-600'}`}>{dailyReport.attendance_status}</span>
                  </p>
                  
                  {/* 🛑 UPDATED DOWNLOAD BUTTON 🛑 */}
                  <Button
                    onClick={() => handleDownloadReport('daily')} // Call the new API download function
                    variant="success"
                    disabled={isDownloadingDaily}
                  >
                    <FiDownload className="mr-2 h-4 w-4" />
                    {isDownloadingDaily ? 'Downloading...' : 'Download Excel'}
                  </Button>
                </div>
                <ReportTable
                  columns={['Punch In', 'Punch Out', 'Work Hours', 'Break Hours']}
                  data={dailyReport.records.map(r => ({
                    'Punch In': r.punch_in,
                    'Punch Out': r.punch_out,
                    'Work Hours': r.work_hours,
                    'Break Hours': r.break_hours,
                  }))}
                />
              </div>
            )}
            {!dailyReport && !isLoadingDaily && <p className="text-center text-gray-500">No report found for this date.</p>}
          </div>
        )}

        {showWeeklyReport && (
          <div className="mt-8 border p-4 rounded-lg bg-gray-50">
            <h3 className="text-xl font-bold mb-4 text-gray-700">Weekly Report for {weeklyReport?.start_date} to {weeklyReport?.end_date}</h3>
            {isLoadingWeekly && <Loader />}
            {weeklyReport && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                  <p className="text-md text-gray-600">
                    <strong>Total Work Hours:</strong> {weeklyReport.total_work_hours_weekly} | 
                    <strong> Total Break Hours:</strong> {weeklyReport.total_break_hours_weekly} | 
                    <strong> Attendance:</strong> {weeklyReport.attendance_percentage}
                  </p>
                  
                  {/* 🛑 UPDATED DOWNLOAD BUTTON 🛑 */}
                  <Button
                    onClick={() => handleDownloadReport('weekly')} // Call the new API download function
                    variant="success"
                    disabled={isDownloadingWeekly}
                  >
                    <FiDownload className="mr-2 h-4 w-4" />
                    {isDownloadingWeekly ? 'Downloading...' : 'Download Excel'}
                  </Button>
                </div>
                <ReportTable
                  columns={['Date', 'Punch In', 'Punch Out', 'Work Hours', 'Break Hours', 'Status']}
                  data={Object.values(weeklyReport.weekly_summary).map(day => ({
                    Date: day.date,
                    'Punch In': day.punch_in || 'N/A',
                    'Punch Out': day.punch_out || 'N/A',
                    'Work Hours': day.work_hours,
                    'Break Hours': day.break_hours,
                    Status: renderStatus(day.status),
                  }))}
                />
              </div>
            )}
            {!weeklyReport && !isLoadingWeekly && <p className="text-center text-gray-500">No report found for this week.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;