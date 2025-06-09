
'use client';
import { useState } from 'react';
import UserForm from '@/components/UserForm';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import callApi from '@/utils/callApi';

const MySwal = withReactContent(Swal);

export default function CreateUserPage() {
  const [formKey, setFormKey] = useState(0); // Force re-render of UserForm

  const handleSubmit = async (values: any) => {
    try {
      // Show loading popup
      MySwal.fire({
        title: 'Creating user...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Make API call
      // await callApi('post', 'http://127.0.0.1:5000/users', values, {
       const baseUrl = process.env.NEXT_PUBLIC_API_URL;
       await callApi('post', `${baseUrl}/users`, values, {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      });

      Swal.close(); // Close loader

      // Show success popup
      MySwal.fire('Success', 'User created successfully!', 'success');
      setFormKey(prev => prev + 1); // Reset form
    } catch (err: any) {
      Swal.close();
      MySwal.fire('Error', err?.response?.data?.detail || 'Failed to create user', 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Create New User</h2>
      <UserForm
        key={formKey}
        isUpdate={false}
        initialValues={{
          first_name: '',
          last_name: '',
          email: '',
          password: '',
          role_type: 'Admin',
          department_name: '',
        }}
        onCancel={() => {
          // Optional reset or redirect
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
