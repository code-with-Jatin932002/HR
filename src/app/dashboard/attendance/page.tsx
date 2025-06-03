'use client';

export default function AttendancePage() {
  const attendances = [
    {
      name: "John Doe",
      designation: "Frontend Developer",
      type: "Office",
      checkIn: "9:05 AM",
      status: "Late",
    },
    {
      name: "Jane Smith",
      designation: "HR Manager",
      type: "Remote",
      checkIn: "8:45 AM",
      status: "On Time",
    },
    {
      name: "Robert Lee",
      designation: "UI/UX Designer",
      type: "Office",
      checkIn: "9:00 AM",
      status: "On Time",
    },
    {
      name: "Emily Davis",
      designation: "Project Manager",
      type: "Remote",
      checkIn: "9:10 AM",
      status: "Late",
    },
  ];
  return (
    <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">Employee Attendance</h1>
        <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <table className="min-w-full text-sm text-left bg-gray-100 text-gray-900 dark:bg-gray-900  dark:text-gray-100">
            <thead className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 uppercase text-sm">
              <tr>
                <th className="px-6 py-3">Employee Name</th>
                <th className="px-6 py-3">Designation</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Check-in Time</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map((emp, idx) => (
                <tr
                  key={idx}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 "
                >
                  <td className="px-6 py-4">{emp.name}</td>
                  <td className="px-6 py-4">{emp.designation}</td>
                  <td className="px-6 py-4">{emp.type}</td>
                  <td className="px-6 py-4">{emp.checkIn}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        emp.status === "On Time"
                          ? "bg-green-200 text-green-800 dark:bg-green-700 dark:text-white"
                          : "bg-red-200 text-red-800 dark:bg-red-700 dark:text-white"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );
}
