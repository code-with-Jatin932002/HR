
// 'use client';

// import React from 'react';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { useEffect, useState } from 'react';
// import { useQuery } from '@tanstack/react-query';

// import { getSidebarRoutes } from '@/utils/sidebarRoutes';

// import {
//   FaUserPlus,
//   FaBuilding,
//   FaIdCard,
//   FaUsers,
//   FaSitemap,
//   FaClock,
//   FaMoneyBill,
//   FaBriefcase,
//   FaUserFriends,
//   FaPlane,
//   FaCalendarAlt,
//   FaCog,
//   FaRegBuilding,
//   FaTachometerAlt, // For Dashboard (optional)
// } from 'react-icons/fa';

// // const iconMap: Record<string, JSX.Element> = {
// const iconMap: Record<string, React.ReactNode> = {

//   Dashboard: <FaTachometerAlt />,
//   'Create User': <FaUsers />,
//   'Create HR': <FaUserPlus />,
//   'Employer Details': <FaBuilding />,
//   'HR Details': <FaIdCard />,
//   Employees: <FaUsers />,
//   Departments: <FaSitemap />,
//   Attendance: <FaClock />,
//   Payroll: <FaMoneyBill />,
//   Jobs: <FaBriefcase />,
//   Candidates: <FaUserFriends />,
//   Leaves: <FaPlane />,
//   Holidays: <FaCalendarAlt />,
//   Settings: <FaCog />,
//   Organization: <FaRegBuilding />
// };

// const Sidebar = () => {
//   const pathname = usePathname();
//   const [role, setRole] = useState('');
//   const [routes, setRoutes] = useState<{ name: string; path: string }[]>([]);

//   useEffect(() => {
//     const storedRole = localStorage.getItem('role_type') || '';
//     setRole(storedRole);
//     setRoutes(getSidebarRoutes(storedRole));
//   }, []);

//   const isActive = (path: string) =>
//     pathname === path
//       ? 'bg-blue-600 text-white'
//       : 'bg-gray-100 text-gray-800 hover:bg-blue-100';

//   return (
//     <aside className="h-screen overflow-y-auto bg-white border-r shadow-sm w-16 md:w-64 transition-all duration-300">
//       <div className="p-4">
//         <h2 className="text-xl font-bold text-blue-600 mb-6 text-center hidden md:block">
//           Dashboard
//         </h2>

//         <ul className="space-y-2">
//           {routes.map(({ name, path }) => (
//             <li key={path}>
//               <Link
//                 href={path}
//                 className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer font-medium text-base ${isActive(
//                   path
//                 )}`}
//               >
//                 <span className="text-lg">{iconMap[name] || <FaUsers />}</span>
//                 <span className="hidden md:inline">{name}</span>
//               </Link>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;








'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getSidebarRoutes } from '@/utils/sidebarRoutes';

import {
  FaUserPlus,
  FaUsers,
  FaIdCard,
  FaBuilding,
  FaSitemap,
  FaClock,
  FaMoneyBill,
  FaBriefcase,
  FaUserFriends,
  FaPlane,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';

const iconMap: Record<string, React.ReactNode> = {
  'Create User': <FaUserPlus />,
  'View Users': <FaUsers />,
  'User Management': <FaUsers />,
  'HR Details': <FaIdCard />,
  Employees: <FaBuilding />,
  Departments: <FaSitemap />,
  Attendance: <FaClock />,
  Payroll: <FaMoneyBill />,
  Jobs: <FaBriefcase />,
  Candidates: <FaUserFriends />,
  Leaves: <FaPlane />,
  Holidays: <FaCalendarAlt />,
};

const Sidebar = () => {
  const pathname = usePathname();
  const [role, setRole] = useState('');
  const [routes, setRoutes] = useState<any[]>([]);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const storedRole = localStorage.getItem('role_type') || '';
    setRole(storedRole);
    setRoutes(getSidebarRoutes(storedRole));
  }, []);

  const isActive = (path: string) =>
    pathname === path
      ? 'bg-blue-600 text-white'
      : 'bg-gray-100 text-gray-800 hover:bg-blue-100';

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <aside className="h-screen overflow-y-auto bg-white border-r shadow-sm w-16 md:w-64 transition-all duration-300">
      <div className="p-4">
        <h2 className="text-xl font-bold text-blue-600 mb-6 text-center hidden md:block">
          Dashboard
        </h2>

        <ul className="space-y-2">
          {routes.map((route) => {
            if ('children' in route) {
              const isOpen = openMenus[route.name] || false;

              return (
                <li key={route.name}>
                  <div
                    onClick={() => toggleMenu(route.name)}
                    className={`flex items-center justify-between px-3 py-3 rounded-lg font-medium text-base cursor-pointer ${
                      isOpen ? 'bg-blue-100' : 'bg-gray-100'
                    } hover:bg-blue-200`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-lg">{iconMap[route.name] || <FaUsers />}</span>
                      <span className="hidden md:inline">{route.name}</span>
                    </div>
                    <span className="hidden md:inline">
                      {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                  </div>

                  {isOpen && (
                    <ul className="ml-6 mt-2 space-y-1">
                      {route.children.map((sub: any) => (
                        <li key={sub.path}>
                          <Link
                            href={sub.path}
                            className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-all duration-200 ${isActive(
                              sub.path
                            )}`}
                          >
                            <span className="text-lg">{iconMap[sub.name] || <FaUsers />}</span>
                            <span className="hidden md:inline">{sub.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={route.path}>
                <Link
                  href={route.path}
                  className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer font-medium text-base ${isActive(
                    route.path
                  )}`}
                >
                  <span className="text-lg">{iconMap[route.name] || <FaUsers />}</span>
                  <span className="hidden md:inline">{route.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
