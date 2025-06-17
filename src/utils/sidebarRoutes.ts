
// utils/sidebarRoutes.ts

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
    { name: 'HR Details', path: '/dashboard/hr-details' },
    { name: 'Employees', path: '/dashboard/employees' },
    { name: 'Departments', path: '/dashboard/departments' },
    { name: 'Attendance', path: '/dashboard/attendance' },
    { name: 'Payroll', path: '/dashboard/payroll' },
    { name: 'Jobs', path: '/dashboard/jobs' },
    { name: 'Candidates', path: '/dashboard/candidates' },
    { name: 'Leaves', path: '/dashboard/leaves' },
    { name: 'Holidays', path: '/dashboard/holidays' },
  ];

  switch (role) {
    case 'super_Admin':
      // Filter out Payroll, Jobs, and Candidates
      const filteredRoutes = commonRoutes.filter(
        (route) =>
          route.name !== 'Payroll' &&
          route.name !== 'Jobs' &&
          route.name !== 'Candidates' &&
          route.name !== 'Leaves'
      );
      return [
        ...filteredRoutes,
        { name: 'Organizations', path: '/dashboard/organization' },
      ];

    case 'Admin':
      return commonRoutes;

    case 'Hr':
      return [
        {
          name: 'User Management',
          children: [
            { name: 'Create User', path: '/dashboard/create-user' },
            { name: 'View Users', path: '/dashboard/view-users' },
          ],
        },
        { name: 'HR Details', path: '/dashboard/hr-details' },
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
