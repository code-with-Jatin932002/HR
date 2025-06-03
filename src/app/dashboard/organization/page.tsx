// src/app/dashboard/organization/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OrganizationForm() {
  const [form, setForm] = useState({
    name: '',
    type: '',
    address: ''
  });

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 👇 You can replace this with an API call to save organization
    console.log('Organization Data:', form);

    // Show a success message or redirect
    alert('Organization Created Successfully!');
    router.push('/dashboard');
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create Organization</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          type="text"
          placeholder="Organization Name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="type"
          type="text"
          placeholder="Organization Type"
          value={form.type}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <input
          name="address"
          type="text"
          placeholder="Organization Address"
          value={form.address}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create
        </button>
      </form>
    </div>
  );
}
