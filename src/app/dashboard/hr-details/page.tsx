'use client';

export default function HrDetails() {
  return (
    <div className="p-10 bg-white rounded-lg shadow-lg min-h-screen">
      <h2 className="text-3xl font-bold text-blue-600 mb-6">HR Details</h2>
      <p className="text-gray-700">Display HR details here...</p>

      {/* Example HR cards - Replace with real data later */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="border p-4 rounded-lg shadow">
          <h4 className="font-bold text-lg text-gray-800 mb-1">John Doe</h4>
          <p>Email: john@example.com</p>
          <p>Department: IT</p>
        </div>
        <div className="border p-4 rounded-lg shadow">
          <h4 className="font-bold text-lg text-gray-800 mb-1">Jane Smith</h4>
          <p>Email: jane@example.com</p>
          <p>Department: HR</p>
        </div>
      </div>
    </div>
  );
}
