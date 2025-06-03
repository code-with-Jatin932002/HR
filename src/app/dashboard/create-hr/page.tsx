
'use client';

import useAuthRedirect from '@/hooks/useAuthRedirect';
import useProtectRoute from '@/hooks/useProtectRoute';


import { useState } from 'react';

export default function CreateHRPage() {

      useAuthRedirect(); // 🔐 protect page
      useProtectRoute();
  
  const [form, setForm] = useState({
    name: '', email: '', contact: '', department: '', password: '',
  });

  const [submittedData, setSubmittedData] = useState<any | null>(null);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log('Creating HR:', form);
    setSubmittedData(form); // ✅ Save submitted data for display
    setForm({              // ✅ Reset form after submission
      name: '', email: '', contact: '', department: '', password: '',
    });
  };

  return (
    <div className="bg-white shadow-lg p-8 rounded-lg">
      <h3 className="text-2xl font-bold text-blue-600 mb-6">Create HR</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input 
          name="name" 
          value={form.name} 
          onChange={handleChange} 
          placeholder="HR Name" 
          className="input-style focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
        />
        <input 
          name="email" 
          value={form.email} 
          onChange={handleChange} 
          placeholder="Email" 
          className="input-style focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
        />
        <input 
          name="contact" 
          value={form.contact} 
          onChange={handleChange} 
          placeholder="Contact" 
          className="input-style focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
        />
        <input 
          name="department" 
          value={form.department} 
          onChange={handleChange} 
          placeholder="Department" 
          className="input-style focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
        />
        <input 
          type="password" 
          name="password" 
          value={form.password} 
          onChange={handleChange} 
          placeholder="Password" 
          className="input-style focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
        />
      </div>
      <button 
        onClick={handleSubmit} 
        className="mt-6 bg-green-600 text-white px-6 py-2 rounded cursor-pointer transition-colors hover:bg-green-700"
      >
        Create HR
      </button>

      {/* ✅ Show submitted data */}
      {submittedData && (
        <div className="mt-8 p-4 bg-gray-100 rounded">
          <h4 className="text-lg font-semibold mb-2 text-green-700">Submitted Data:</h4>
          <ul className="space-y-1">
            <li><strong>Name:</strong> {submittedData.name}</li>
            <li><strong>Email:</strong> {submittedData.email}</li>
            <li><strong>Contact:</strong> {submittedData.contact}</li>
            <li><strong>Department:</strong> {submittedData.department}</li>
            <li><strong>Password:</strong> {submittedData.password}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
