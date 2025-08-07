'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import callApi from '@/utils/callApi';
import { toast } from 'react-hot-toast';
import { format, isValid, parseISO, differenceInSeconds } from 'date-fns';

import { useAuth } from '@/context/AuthContext';
import { useTimeTracker } from '@/context/TimeTrackerContext'; // Import useTimeTracker
import Loader from '@/components/Loader';

interface TimeTrackerData {
  user_id: string;
  punch_in: string | null;
  punch_out: string | null;
  duration: string | null; // Total work duration
  activity: string | null;
  break_start: string | null;
  total_break_duration: string | null;
  resume_time: string | null;
  id: string;
  created_at: string;
  updated_at: string;
}

const AttendancePage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  // Consume states and update functions from TimeTrackerContext
  const {
    timeTrackerStatus,
    currentStatus,
    loadingTimeTracker,
    updateTimeTrackerStatus,
    updateAttendanceStatus,
  } = useTimeTracker();

  const [isLoadingAction, setIsLoadingAction] = useState(false); // State for action loading
  const [elapsedSeconds, setElapsedSeconds] = useState(0); // State for the real-time timer
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const ACTION_API_PATH = '/time-tracker/toggle';

  // Function to calculate and update current elapsed time
  const calculateElapsedTime = useCallback(() => {
    if (timeTrackerStatus && timeTrackerStatus.punch_in && !timeTrackerStatus.punch_out) {
      const punchInTime = parseISO(timeTrackerStatus.punch_in);
      const now = new Date(); // Get current local time

      if (!isValid(punchInTime) || !isValid(now)) {
        setElapsedSeconds(0);
        return;
      }

      let totalActiveSeconds = differenceInSeconds(now, punchInTime);

      // Subtract break duration if a break has occurred and been resumed
      if (timeTrackerStatus.break_start && timeTrackerStatus.resume_time) {
        const breakStartTime = parseISO(timeTrackerStatus.break_start);
        const resumeTime = parseISO(timeTrackerStatus.resume_time);
        
        if (isValid(breakStartTime) && isValid(resumeTime)) {
          totalActiveSeconds -= differenceInSeconds(resumeTime, breakStartTime);
        }
      } else if (timeTrackerStatus.break_start && !timeTrackerStatus.resume_time) {
        // If currently on break, the elapsed time should only count until break_start
        const breakStartTime = parseISO(timeTrackerStatus.break_start);
        if (isValid(breakStartTime)) {
            totalActiveSeconds = differenceInSeconds(breakStartTime, punchInTime);
        }
      }

      setElapsedSeconds(Math.max(0, totalActiveSeconds));
    } else {
      setElapsedSeconds(0);
    }
  }, [timeTrackerStatus]);

  // Effect to manage the real-time timer
  useEffect(() => {
    // Start timer only if currently punched in
    if (currentStatus === 'punchedIn') {
      // Clear any existing interval to prevent duplicates
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      // Set a new interval to update elapsed time every second
      timerIntervalRef.current = setInterval(() => {
        calculateElapsedTime();
      }, 1000);
    } else {
      // If not punched in, clear the timer and reset elapsed seconds
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
  }, [currentStatus, calculateElapsedTime]); // Removed timeTrackerStatus from dependencies here, as calculateElapsedTime already depends on it

  // Helper to format elapsed seconds into HH:MM:SS
  const formatElapsedTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map(unit => String(unit).padStart(2, '0'))
      .join(':');
  };

  const handleTimeTrackerAction = async (actionType: 'toggle' | 'break' | 'punchout') => {
    setIsLoadingAction(true); // Set loading for the action
    try {
      const response: TimeTrackerData = await callApi('POST', `${ACTION_API_PATH}?action=${actionType}`);

      // Update global context states with the new data from the API
      updateTimeTrackerStatus(response); // Updates timeTrackerStatus and persists to sessionStorage
      updateAttendanceStatus(response); // Updates currentStatus and persists to sessionStorage

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
      setIsLoadingAction(false); // Reset loading for the action
    }
  };

  const formatDuration = (duration: string | null) => {
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
    if (!isoString) return 'N/A';
    const date = parseISO(isoString);
    return isValid(date) ? format(date, 'MMM dd, yyyy HH:mm:ss') : 'Invalid Date';
  };

  // Show a general loading state for both auth and page data
  if (authLoading || loadingTimeTracker || isLoadingAction) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8 text-center text-gray-600">
        Please log in to view the time tracker.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <div className={`bg-white shadow-2xl rounded-2xl p-8 mb-10 border border-gray-100 transform transition-transform duration-300 hover:scale-[1.005]
        ${currentStatus === 'notStarted' ? 'bg-[url(/images/pattern-dots.svg)] bg-repeat-x bg-[bottom_left] md:bg-repeat-round' : ''}
      `}>
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-700">Current Session</h2>

        <div className="text-center mb-8">
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

        {timeTrackerStatus ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-gray-700 text-lg">
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
        ) : (
          <p className="text-center text-gray-600 text-lg py-4">
            <span className="font-semibold text-gray-700">No active session for today.</span> <br />
            Click "Punch In" below to begin your workday.
          </p>
        )}

        <div className="mt-10 flex flex-wrap justify-center gap-6">
          {currentStatus === 'notStarted' && (
            <button
              onClick={() => handleTimeTrackerAction('toggle')}
              className="flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-4 focus:ring-green-400 focus:ring-offset-2 transform transition-all duration-300 hover:scale-105 cursor-pointer"
              disabled={isLoadingAction} // Disable button during action
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Punch In
            </button>
          )}

          {currentStatus === 'punchedIn' && (
            <>
              <button
                onClick={() => handleTimeTrackerAction('break')}
                className="flex items-center px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold text-lg rounded-xl shadow-lg hover:from-yellow-600 hover:to-orange-600 focus:outline-none focus:ring-4 focus:ring-yellow-400 focus:ring-offset-2 transform transition-all duration-300 hover:scale-105 cursor-pointer"
                disabled={isLoadingAction} // Disable button during action
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m0 0l-3-3m3 3l3-3m-6 3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Start Break
              </button>
              <button
                onClick={() => handleTimeTrackerAction('punchout')}
                className="flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-4 focus:ring-red-400 focus:ring-offset-2 transform transition-all duration-300 hover:scale-105 cursor-pointer"
                disabled={isLoadingAction} // Disable button during action
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H5a3 3 0 01-3-3v-10a3 3 0 013-3h5a3 3 0 013 3v1"></path></svg>
                Punch Out
              </button>
            </>
          )}

          {currentStatus === 'onBreak' && (
            <button
              onClick={() => handleTimeTrackerAction('break')}
              className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-400 focus:ring-offset-2 transform transition-all duration-300 hover:scale-105 cursor-pointer"
              disabled={isLoadingAction} // Disable button during action
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2zm0 0H7m0 0h-1M4 16v-3a2 2 0 012-2h4a2 2 0 012 2v3m0 0h-4"></path></svg>
              End Break / Resume Work
            </button>
          )}

          {currentStatus === 'punchedOut' && (
            <p className="text-gray-700 text-xl font-medium bg-green-50 p-4 rounded-lg shadow-inner border border-green-200">
              You have successfully punched out for today!
              {timeTrackerStatus && (
                <span className="block mt-2 text-green-700">Total Work Duration: <span className="font-bold">{formatDuration(timeTrackerStatus.duration)}</span></span>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;