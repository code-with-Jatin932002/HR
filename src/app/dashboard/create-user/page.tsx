// create-user.tsx
'use client';

import { useState } from 'react';
import UserForm from '@/components/UserForm';
import toast from 'react-hot-toast'; // Import react-hot-toast
import callApi from '@/utils/callApi';
import { useRouter } from 'next/navigation';

import useProtectRoute from '@/hooks/useProtectRoute';
import { useAuth } from '@/context/AuthContext';
import Loader from '@/components/Loader'; // Import your custom Loader

export default function CreateUserPage() {
  useProtectRoute();
  const { loading, user } = useAuth();
  const [formLoading, setFormLoading] = useState(false); // State for form-specific loading

  if (loading) return null;

  const [formKey, setFormKey] = useState(0);
  const router = useRouter();

  const handleSubmit = async (values: any) => {
    setFormLoading(true); // Start form loading, which triggers your custom Loader

    // Show loading toast with text only, no built-in icon/spinner.
    // react-hot-toast uses its default styling (light background) if no 'style' or 'icon' is provided.
    const loadingToastId = toast.loading('Creating user...');

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      await callApi('post', `${baseUrl}/users`, values, {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      });

      // Dismiss loading toast and show success toast (default styling)
      toast.success('User created successfully!', { id: loadingToastId });
      setFormKey((prev) => prev + 1);
      router.push('/dashboard/view-users');
    } catch (err: any) {
      // Dismiss loading toast and show error toast (default styling)
      toast.dismiss(loadingToastId);
      const backendMessage =
        err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Failed to create user.';
      toast.error(backendMessage);
    } finally {
      setFormLoading(false); // End form loading
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-3xl rounded bg-white p-6 shadow">
      <h2 className="mb-4 text-2xl font-bold">Create New User</h2>
      {/* Apply overlay loader directly within the context */}
      <div className="relative">
        {formLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-white bg-opacity-80">
            <Loader /> {/* Your custom Loader */}
          </div>
        )}
        <UserForm
          key={formKey}
          isUpdate={false}
          initialValues={{
            first_name: '',
            last_name: '',
            email: '',
            password: '',
            role_type: '',
            department_name: '',
          }}
          onCancel={() => {}}
          onSubmit={handleSubmit}
          currentUserRole={user?.role_type || ''}
          isSubmitting={formLoading} // Still pass to disable individual fields
        />
      </div>
    </div>
  );
}