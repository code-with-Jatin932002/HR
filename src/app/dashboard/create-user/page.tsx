
// app/dashboard/create-user/page.tsx
'use client';
import { useState } from 'react';
import UserForm from '@/components/UserForm';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import callApi from '@/utils/callApi';
import { useRouter } from 'next/navigation';

import useProtectRoute from '@/hooks/useProtectRoute';
import { useAuth } from '@/context/AuthContext'; // Import useAuth

const MySwal = withReactContent(Swal);

export default function CreateUserPage() {
    useProtectRoute(); // 🔐 protect page
    const { loading, user } = useAuth(); // Get user object from AuthContext
    if (loading) return null;

    const [formKey, setFormKey] = useState(0);
    const router = useRouter();

    const handleSubmit = async (values: any) => {
        try {
            MySwal.fire({
                title: 'Creating user...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const baseUrl = process.env.NEXT_PUBLIC_API_URL;
            await callApi('post', `${baseUrl}/users`, values, {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            });

            Swal.close();
            await MySwal.fire('Success', 'User created successfully!', 'success');
            setFormKey(prev => prev + 1);
            router.push('/dashboard/view-users');

        } catch (err: any) {
            Swal.close();
            let errorMessage = 'Failed to create user.';
            if (err?.response?.data?.detail) {
                errorMessage = err.response.data.detail;
            } else if (err?.message) {
                errorMessage = err.message;
            }
            MySwal.fire('Error', errorMessage, 'error');
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
                    role_type: 'Employee', // Default to 'Employee' or first allowed role
                    department_name: '',
                }}
                onCancel={() => {}}
                onSubmit={handleSubmit}
                currentUserRole={user?.role_type || ''} // Pass the logged-in user's role
            />
        </div>
    );
}