// components/Sidebar.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getSidebarRoutes } from '@/utils/sidebarRoutes';
import {
  FaUserPlus, FaUsers, FaIdCard, FaBuilding, FaSitemap, FaClock,
  FaMoneyBill, FaBriefcase, FaUserFriends, FaPlane, FaCalendarAlt,
  FaChevronDown, FaChevronUp, FaPlusCircle, FaCheckCircle, FaTimesCircle,
  FaHourglassHalf, FaTachometerAlt, FaBullhorn, FaComment // Import the new icon for Feedback
} from 'react-icons/fa';

interface ChildRoute {
  name: string;
  path: string;
}

interface ParentRoute {
  name: string;
  children: ChildRoute[];
}

type SidebarRoute = ChildRoute | ParentRoute;

const iconMap: Record<string, React.ReactNode> = {
  'Create User': <FaUserPlus className="text-xl" />,
  'View Users': <FaUsers className="text-xl" />,
  'User Management': <FaUsers className="text-xl" />,
  'HR Details': <FaIdCard className="text-xl" />,
  Employees: <FaBuilding className="text-xl" />,
  Departments: <FaSitemap className="text-xl" />,
  Attendance: <FaClock className="text-xl" />,
  Payroll: <FaMoneyBill className="text-xl" />,
  Jobs: <FaBriefcase className="text-xl" />,
  Candidates: <FaUserFriends className="text-xl" />,
  Leaves: <FaPlane className="text-xl" />,
  'Pending': <FaPlusCircle className="text-xl" />,
  Accepted: <FaCheckCircle className="text-xl" />,
  Rejected: <FaTimesCircle className="text-xl" />,
  Holidays: <FaCalendarAlt className="text-xl" />,
  Organizations: <FaBuilding className="text-xl" />,
  'Organizations Type': <FaSitemap className="text-xl" />,
  Dashboard: <FaTachometerAlt className="text-xl" />,
  'Time Tracker': <FaHourglassHalf className="text-xl" />,
  'Announcements': <FaBullhorn className="text-xl" />,
  'Feedback': <FaComment className="text-xl" />, // <-- NEW Feedback Icon
};

const Sidebar = () => {
  const pathname = usePathname();
  const [role, setRole] = useState('');
  const [routes, setRoutes] = useState<SidebarRoute[]>([]);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const storedRole = sessionStorage.getItem('role_type') || '';
    setRole(storedRole);
    const availableRoutes = getSidebarRoutes(storedRole);
    setRoutes(availableRoutes);

    const initialOpenMenus: Record<string, boolean> = {};
    availableRoutes.forEach((route) => {
      if ('children' in route && route.children) {
        if (route.children.some((sub: ChildRoute) => pathname.startsWith(sub.path))) {
          initialOpenMenus[route.name] = true;
        }
      }
    });
    setOpenMenus(initialOpenMenus);
  }, [pathname]);

  const isActive = (path: string) => pathname === path;

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <aside className="h-full overflow-y-auto bg-gray-50 border-r w-20 md:w-64 transition-all duration-300 shadow-sm">
      <div className="p-4 pt-6">
        {/* Top - Dashboard Item */}
        <div className="mb-2.5">
          <Link
            href="/dashboard"
            className={`flex items-center gap-4 px-4 py-2.5 rounded-xl text-base font-semibold transition-all duration-200 justify-center md:justify-start
              ${pathname === '/dashboard'
                ? 'bg-purple-100 text-purple-500 border-l-4 border-purple-600'
                : 'text-gray-600 hover:bg-purple-100'
              }`}
          >
            {iconMap['Dashboard']}
            <span className="hidden md:inline">Dashboard</span>
          </Link>
        </div>

        {/* Sidebar Items */}
        <ul className="flex flex-col gap-2.5">
          {routes.map((route) => {
            const isOpen = openMenus[route.name] || false;

            if ('children' in route && route.children) {
              return (
                <li key={route.name}>
                  <div
                    onClick={() => toggleMenu(route.name)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 w-full text-base
                      ${isOpen
                        ? 'bg-purple-100 text-purple-500 font-semibold border-l-4 border-purple-500'
                        : 'text-gray-800 hover:bg-purple-100'
                      }`}
                  >
                    <div className="flex items-center gap-4 w-full justify-center md:justify-start">
                      {iconMap[route.name]}
                      <span className="hidden md:inline truncate">{route.name}</span>
                    </div>
                    <span className="hidden md:block">
                      {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                  </div>

                  {isOpen && (
                    <ul className="flex flex-col gap-2.5 mt-2 ml-0 md:ml-6">
                      {route.children.map((sub: ChildRoute) => (
                        <li key={sub.path}>
                          <Link
                            href={sub.path}
                            className={`flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm justify-center md:justify-start
                              ${isActive(sub.path)
                                ? 'bg-purple-100 text-purple-500 font-medium border-l-4 border-purple-500'
                                : 'text-gray-700 hover:bg-purple-100'
                              }`}
                          >
                            {iconMap[sub.name]}
                            <span className="hidden md:inline truncate">{sub.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={route.name}>
                <Link
                  href={(route as ChildRoute).path}
                  className={`flex items-center gap-4 px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer text-base justify-center md:justify-start
                    ${isActive((route as ChildRoute).path)
                      ? 'bg-purple-100 text-purple-500 font-semibold border-l-4 border-puprle-600'
                      : 'text-gray-800 hover:bg-purple-100'
                    }`}
                >
                  {iconMap[route.name]}
                  <span className="hidden md:inline truncate">{route.name}</span>
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