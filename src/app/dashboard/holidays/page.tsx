'use client';
import { CalendarDays } from "lucide-react";

export default function HolidaysPage() {
   const holidays = [
    { date: "2025-01-26", day: "Sunday", name: "Republic Day" },
    { date: "2025-03-17", day: "Monday", name: "Holi" },
    { date: "2025-08-15", day: "Friday", name: "Independence Day" },
    { date: "2025-10-02", day: "Thursday", name: "Gandhi Jayanti" },
    { date: "2025-12-25", day: "Thursday", name: "Christmas" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 px-6 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-6">
            <CalendarDays className="text-blue-500 dark:text-blue-400" />
            Holiday Calendar
          </h1>

          <div className="rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
            <table className="w-full text-sm text-left">
              <thead className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white uppercase">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Day</th>
                  <th className="px-6 py-4">Holiday Name</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((holiday, idx) => (
                  <tr
                    key={idx}
                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-200 font-medium">
                      {holiday.date}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {holiday.day}
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white font-semibold">
                      {holiday.name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
            * Holiday list is subject to change based on government notifications.
          </p>
        </div>
      </div>
  );
}
