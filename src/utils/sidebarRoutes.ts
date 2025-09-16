// utils/sidebarRoutes.ts
export const getSidebarRoutes = (role: string) => {
  const commonRoutes = [
    {
      name: 'User Management',
      children: [
        { name: 'Create User', path: '/dashboard/create-user' },
        { name: 'View Users', path: '/dashboard/view-users' },
      ],
    },
    // { name: 'Departments', path: '/dashboard/departments' },
     { name: 'Attendance', path: '/dashboard/attendance' },
    { name: 'Payroll', path: '/dashboard/payroll' },
    { name: 'Jobs', path: '/dashboard/jobs' },
    { name: 'Candidates', path: '/dashboard/candidates' },
    {
      name: 'Leaves',
      children: [
        { name: 'Pending', path: '/dashboard/leaves/pending' },
        { name: 'Accepted', path: '/dashboard/leaves/accepted' },
        { name: 'Rejected', path: '/dashboard/leaves/rejected' },
      ],
    },
    { name: 'Holidays', path: '/dashboard/holidays' },
    // Add Time Tracker here
    { name: 'Time Tracker', path: '/dashboard/time-tracker' }, // <-- NEW
    { name: 'Announcements', path: '/dashboard/announcement' },
    { name: 'Feedback', path: '/dashboard/feedback' },
  ];

  switch (role) {
    case 'super_Admin':
      const filteredRoutesForSuperAdmin = commonRoutes.filter(
        (route) =>
          route.name !== 'Payroll' &&
          route.name !== 'Jobs' &&
          route.name !== 'Candidates' &&
          route.name !== 'Leaves' &&
          route.name !== 'Attendance' &&
          route.name !== 'Announcements' &&
          route.name !== 'Feedback' &&
          route.name !== 'Time Tracker',
      );
      return filteredRoutesForSuperAdmin;

    case 'Admin':
      // The Admin role will see all common routes except for "Leaves"
      const filteredRoutesForAdmin = commonRoutes.filter(
        (route) => route.name !== 'Leaves',
      );
      return filteredRoutesForAdmin;

    case 'Hr':
    case 'Manager':
      return commonRoutes;

    case 'Employee':
      return [
        {
          name: 'Leaves',
          children: [
            { name: 'Pending', path: '/dashboard/leaves/pending' },
            { name: 'Accepted', path: '/dashboard/leaves/accepted' },
            { name: 'Rejected', path: '/dashboard/leaves/rejected' },
          ],
        },
        { name: 'Holidays', path: '/dashboard/holidays' },
        // { name: 'Attendance', path: '/dashboard/attendance' },
        { name: 'Time Tracker', path: '/dashboard/time-tracker' }, // <-- NEW for Employee
        { name: 'Announcements', path: '/dashboard/announcement' },
        { name: 'Feedback', path: '/dashboard/feedback' },
        { name: 'Jobs', path: '/dashboard/jobs' },

      ];

    default:
      return commonRoutes;
  }
};