// src/context/TimeTrackerContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { parseISO, isValid, format } from 'date-fns';
// import callApi from '@/utils/callApi'; // No longer directly used in initialization

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

type CurrentStatus = 'punchedIn' | 'onBreak' | 'punchedOut' | 'notStarted';

interface TimeTrackerContextType {
  timeTrackerStatus: TimeTrackerData | null;
  currentStatus: CurrentStatus;
  loadingTimeTracker: boolean;
  updateTimeTrackerStatus: (data: TimeTrackerData | null) => void;
  updateAttendanceStatus: (data: TimeTrackerData | null) => void;
  // initializeTimeTrackerStatus is now for internal use in the provider,
  // as it doesn't involve a direct external fetch from a GET API
}

const TimeTrackerContext = createContext<TimeTrackerContextType | undefined>(undefined);

export function TimeTrackerProvider({ children }: { children: React.ReactNode }) {
  const [timeTrackerStatus, setTimeTrackerStatus] = useState<TimeTrackerData | null>(null);
  const [currentStatus, setCurrentStatus] = useState<CurrentStatus>('notStarted');
  const [loadingTimeTracker, setLoadingTimeTracker] = useState(true);

  // Helper function to determine current status based on data
  const determineCurrentStatus = useCallback((data: TimeTrackerData | null): CurrentStatus => {
    if (!data || data.punch_out) { // If no data or already punched out
      return 'punchedOut';
    } else if (data.break_start && !data.resume_time) { // Break started but not resumed
      return 'onBreak';
    } else if (data.punch_in && !data.punch_out && data.resume_time) { // Punched in, resumed from break, not punched out
      return 'punchedIn';
    } else if (data.punch_in && !data.punch_out && !data.break_start && !data.resume_time) { // Punched in, no breaks, not punched out
      return 'punchedIn';
    } else {
      return 'notStarted'; // Default or initial state
    }
  }, []);

  // This function updates the actual state and persists to sessionStorage
  const updateTimeTrackerStatus = useCallback((data: TimeTrackerData | null) => {
    setTimeTrackerStatus(data);
    if (data) {
      sessionStorage.setItem('timeTrackerStatus', JSON.stringify(data));
      // Always update currentStatus as well based on the new data
      sessionStorage.setItem('currentStatus', determineCurrentStatus(data));
    } else {
      sessionStorage.removeItem('timeTrackerStatus');
      sessionStorage.removeItem('currentStatus');
    }
  }, [determineCurrentStatus]);

  // This function updates only the currentStatus, useful if timeTrackerData isn't changing
  const updateAttendanceStatus = useCallback((data: TimeTrackerData | null) => {
    setCurrentStatus(determineCurrentStatus(data));
    // The currentStatus is already saved by updateTimeTrackerStatus,
    // but if we call this directly, we ensure currentStatus in sessionStorage is correct.
    if (data) {
      sessionStorage.setItem('currentStatus', determineCurrentStatus(data));
    } else {
      sessionStorage.removeItem('currentStatus');
    }
  }, [determineCurrentStatus]);

  // Effect to load initial state from sessionStorage when the provider mounts
  useEffect(() => {
    try {
      const storedStatus = sessionStorage.getItem('timeTrackerStatus');
      const storedCurrentStatus = sessionStorage.getItem('currentStatus') as CurrentStatus;

      if (storedStatus && storedCurrentStatus) {
        const parsedStatus: TimeTrackerData = JSON.parse(storedStatus);
        
        // Before setting, perform a basic check if the stored data is "for today".
        // This is crucial to avoid showing "punched in" from a previous day.
        // You'll need to define what "today" means (e.g., compare punch_in date with current date).
        // For simplicity, let's assume if punch_out exists, it's completed for that day.
        // If punch_out is null, we assume it's an ongoing session for "today".
        const today = format(new Date(), 'yyyy-MM-dd');
        const punchInDate = parsedStatus.punch_in ? format(parseISO(parsedStatus.punch_in), 'yyyy-MM-dd') : null;

        if (punchInDate === today && !parsedStatus.punch_out) {
            // It's an active session for today
            setTimeTrackerStatus(parsedStatus);
            setCurrentStatus(storedCurrentStatus);
        } else if (parsedStatus.punch_out && punchInDate === today) {
            // It's a completed session for today
            setTimeTrackerStatus(parsedStatus);
            setCurrentStatus('punchedOut'); // Force 'punchedOut' if session is completed
        } else {
            // Stored session is from a previous day or invalid, clear it
            sessionStorage.removeItem('timeTrackerStatus');
            sessionStorage.removeItem('currentStatus');
            setTimeTrackerStatus(null);
            setCurrentStatus('notStarted');
        }
      } else {
        // No stored data
        setTimeTrackerStatus(null);
        setCurrentStatus('notStarted');
      }
    } catch (error) {
      console.error('Failed to load time tracker status from sessionStorage:', error);
      // Clear potentially corrupted data
      sessionStorage.removeItem('timeTrackerStatus');
      sessionStorage.removeItem('currentStatus');
      setTimeTrackerStatus(null);
      setCurrentStatus('notStarted');
    } finally {
      setLoadingTimeTracker(false);
    }
  }, []); // Empty dependency array means this runs once on mount

  return (
    <TimeTrackerContext.Provider
      value={{
        timeTrackerStatus,
        currentStatus,
        loadingTimeTracker,
        updateTimeTrackerStatus,
        updateAttendanceStatus,
      }}
    >
      {children}
    </TimeTrackerContext.Provider>
  );
}

export const useTimeTracker = () => {
  const context = useContext(TimeTrackerContext);
  if (context === undefined) {
    throw new Error('useTimeTracker must be used within a TimeTrackerProvider');
  }
  return context;
};