
'use client';
import { useState } from 'react';
import UserForm from '@/components/UserForm';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import callApi from '@/utils/callApi';

const MySwal = withReactContent(Swal);

export default function CreateUserPage() {
  const [formKey, setFormKey] = useState(0); // This will force UserForm to re-render with fresh state

  const handleSubmit = async (values: any) => {
    try {
      await callApi('post', 'http://127.0.0.1:5000/users', values, {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      });

      MySwal.fire('Success', 'User created successfully!', 'success');

      // Reset form by changing key
      setFormKey(prev => prev + 1);
    } catch (err: any) {
      MySwal.fire('Error', err?.response?.data?.detail || 'Failed to create user', 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Create New User</h2>
      <UserForm
        key={formKey} // changing key forces fresh form
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
          // Optionally hide or reset form
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
