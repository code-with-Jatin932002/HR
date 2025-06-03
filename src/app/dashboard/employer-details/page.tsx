
'use client';

export default function EmployerDetails() {
  return (
    <div className="p-10 bg-white rounded-lg shadow-lg min-h-screen">
      <h2 className="text-3xl font-bold text-blue-600 mb-6">Employer Details</h2>
      <p className="text-gray-700">Display employer details here...</p>

      {/* Employee Table */}
      <h2 className="text-2xl font-semibold text-blue-600 mt-10 mb-4">Employee Details</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-left text-gray-600 uppercase text-sm">
              <th className="py-3 px-6">Employer Name</th>
              <th className="py-3 px-6">Employee ID</th>
              <th className="py-3 px-6">Department</th>
              <th className="py-3 px-6">Designation</th>
              <th className="py-3 px-6">Type</th>
              <th className="py-3 px-6">Status</th>
              <th className="py-3 px-6">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="py-3 px-6">TechCorp Ltd</td>
              <td className="py-3 px-6">EMP001</td>
              <td className="py-3 px-6">Engineering</td>
              <td className="py-3 px-6">Software Developer</td>
              <td className="py-3 px-6">Full-time</td>
              <td className="py-3 px-6">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">Active</span>
              </td>
              <td className="py-3 px-6 flex space-x-2">
                <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">Delete</button>
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm">View</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
