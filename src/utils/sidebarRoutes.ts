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
    { name: 'Departments', path: '/dashboard/departments' },
    // { name: 'Attendance', path: '/dashboard/attendance' },
    { name: 'Payroll', path: '/dashboard/payroll' },
    { name: 'Jobs', path: '/dashboard/jobs' },
    { name: 'Candidates', path: '/dashboard/candidates' },
    {
      name: 'Leaves',
      children: [
        { name: 'Create Leave', path: '/dashboard/leaves/pending' },
        { name: 'Accepted', path: '/dashboard/leaves/accepted' },
        { name: 'Rejected', path: '/dashboard/leaves/rejected' },
      ],
    },
    { name: 'Holidays', path: '/dashboard/holidays' },
    // Add Time Tracker here
    { name: 'Time Tracker', path: '/dashboard/time-tracker' }, // <-- NEW
  ];

  switch (role) {
    case 'super_Admin':
      const filteredRoutesForAdmin = commonRoutes.filter(
        (route) =>
          route.name !== 'Payroll' &&
          route.name !== 'Jobs' &&
          route.name !== 'Candidates' &&
          route.name !== 'Leaves' &&
          route.name !== 'Time Tracker' // <-- Ensure Super Admin doesn't see it
      );
      return [
        ...filteredRoutesForAdmin,
        { name: 'Organizations', path: '/dashboard/organization' },
        { name: 'Organizations Type', path: '/dashboard/organization-type' },
      ];

    case 'Hr':
    case 'Manager':
      return commonRoutes;

    case 'Employee':
      return [
        {
          name: 'Leaves',
          children: [
            { name: 'Create Leave', path: '/dashboard/leaves/pending' },
            { name: 'Accepted', path: '/dashboard/leaves/accepted' },
            { name: 'Rejected', path: '/dashboard/leaves/rejected' },
          ],
        },
        { name: 'Holidays', path: '/dashboard/holidays' },
        // { name: 'Attendance', path: '/dashboard/attendance' },
        { name: 'Time Tracker', path: '/dashboard/time-tracker' }, // <-- NEW for Employee
      ];

    default:
      return commonRoutes;
  }
};




















