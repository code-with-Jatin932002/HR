// utils/sidebarRoutes.ts
export const getSidebarRoutes = (role: string) => {
  switch (role) {

    case 'super_Admin':
      return [
        // { name: 'Dashboard', path: '/dashboard/dash' },
        { name: 'Create User', path: '/dashboard/create-user' },
        { name: 'HR Details', path: '/dashboard/hr-details' },
        { name: 'Employees', path: '/dashboard/employees' },
        { name: 'Departments', path: '/dashboard/departments' },
        { name: 'Attendance', path: '/dashboard/attendance' },
        { name: 'Payroll', path: '/dashboard/payroll' },
        { name: 'Jobs', path: '/dashboard/jobs' },
        { name: 'Candidates', path: '/dashboard/candidates' },
        { name: 'Leaves', path: '/dashboard/leaves' },
        { name: 'Holidays', path: '/dashboard/holidays' },
        // { name: 'Settings', path: '/dashboard/settings' },
      ];

    case 'Admin':
      return [
        // { name: 'Dashboard', path: '/dashboard/dash' },
        { name: 'Create User', path: '/dashboard/create-user' },
        { name: 'HR Details', path: '/dashboard/hr-details' },
        { name: 'Employees', path: '/dashboard/employees' },
        { name: 'Departments', path: '/dashboard/departments' },
        { name: 'Attendance', path: '/dashboard/attendance' },
        { name: 'Payroll', path: '/dashboard/payroll' },
        { name: 'Jobs', path: '/dashboard/jobs' },
        { name: 'Candidates', path: '/dashboard/candidates' },
        { name: 'Leaves', path: '/dashboard/leaves' },
        { name: 'Holidays', path: '/dashboard/holidays' },
        // { name: 'Settings', path: '/dashboard/settings' },
      ];

    case 'Hr':
      return [
        { name: 'HR Details', path: '/dashboard/hr-details' },
        { name: 'Create User', path: '/dashboard/create-user' },
        { name: 'Employees', path: '/dashboard/employees' },
        { name: 'Attendance', path: '/dashboard/attendance' },
        { name: 'Jobs', path: '/dashboard/jobs' },
        { name: 'Candidates', path: '/dashboard/candidates' },
        { name: 'Leaves', path: '/dashboard/leaves' },
      ];
      
    case 'Employee':
      return [
        { name: 'Candidates', path: '/dashboard/candidates' },
        { name: 'Holidays', path: '/dashboard/holidays' },
        { name: 'Attendance', path: '/dashboard/attendance' },
      ];
    default:
      return [];
  }
};
