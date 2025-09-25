// src/app/dashboard/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaBuilding, FaUser, FaSpinner, FaSave, FaTimesCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import callApi from '@/utils/callApi';
import { useAuth } from '@/context/AuthContext';

// Define interfaces for both data types
interface OrgData {
    org_name: string;
    email: string;
    address: string;
    phone_number: string;
    organization_type: string;
    description: string;
    website: string;
    gst_number: string;
    country: string;
    country_code: string;
    state: string;
    role_type: string;
}

interface UserData {
    first_name: string;
    last_name: string;
    email: string;
    role_type: string;
    department_name: string;
    date_of_birth: string | null;
    gender: string | null;
    image_url: string | null;
    mobile_number: string | null;
    marital_status: string | null;
    address: string | null;
    employee_type: string | null;
    joining_date: string | null;
    working_days: string | null;
    official_email: string | null;
    slack_id: string | null;
    github_id: string | null;
}

export default function MyProfileFormPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const isSuperAdmin = user?.role_type?.toLowerCase() === 'super_admin';

    const [formData, setFormData] = useState<OrgData | UserData>({} as OrgData | UserData);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profileId, setProfileId] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (authLoading) return;

            if (!user?.email) {
                toast.error('User not logged in or invalid session.');
                setLoading(false);
                return;
            }

            const token = sessionStorage.getItem('token');
            if (!token) {
                toast.error('Authentication token missing.');
                setLoading(false);
                return;
            }

            const baseUrl = process.env.NEXT_PUBLIC_API_URL;
            let apiUrl = '';
            let id = '';
            
            if (isSuperAdmin) {
                id = user.organization_id || '';
                apiUrl = `${baseUrl}/organization/${id}`;
            } else {
                id = user.user_id || '';
                apiUrl = `${baseUrl}/users/${id}`;
            }

            if (!id) {
                toast.error('Missing ID to fetch profile.');
                setLoading(false);
                return;
            }

            setProfileId(id);

            try {
                const response = await callApi('get', apiUrl, null, {
                    Authorization: `Bearer ${token}`,
                });
                const apiData = response.data || response;

                if (apiData) {
                    if (isSuperAdmin) {
                        setFormData({
                            ...apiData,
                            email: user.email,
                            role_type: user.role_type,
                        } as OrgData);
                    } else {
                        setFormData({
                            ...apiData,
                            email: user.email,
                            role_type: user.role_type,
                        } as UserData);
                    }
                }
            } catch (error: any) {
                // console.error("Failed to fetch profile details:", error);
                const errorMessage = error.response?.data?.detail || 'Failed to load profile data.';
                toast.error(errorMessage);
                if (error.response?.status === 403) {
                    router.back();
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [user, isSuperAdmin, router, authLoading]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = sessionStorage.getItem('token');

        if (!token || !profileId) {
            toast.error('Missing token or profile ID.');
            setIsSubmitting(false);
            return;
        }

        try {
            let dataToUpdate: any = {};
            let apiUrl = '';

            if (isSuperAdmin) {
                const { role_type, email, gst_number, organization_type, ...orgDataToUpdate } = formData as OrgData;
                dataToUpdate = orgDataToUpdate;
                apiUrl = `${baseUrl}/organization/${profileId}`;
            } else {
                const { role_type, email, ...userDataToUpdate } = formData as UserData;
                dataToUpdate = userDataToUpdate;
                apiUrl = `${baseUrl}/users/${profileId}`;
            }

            await callApi('put', apiUrl, dataToUpdate, {
                Authorization: `Bearer ${token}`,
            });

            toast.success('Profile updated successfully!');
        } catch (error: any) {
            // console.error("Failed to update profile:", error);
            const errorMessage = error.response?.data?.detail || 'Failed to update profile. Please try again.';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <FaSpinner className="animate-spin text-blue-500 text-5xl mr-2" />
                <p className="text-gray-600">Loading profile...</p>
            </div>
        );
    }

    const renderForm = () => {
        if (isSuperAdmin) {
            const orgData = formData as OrgData;
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="email" name="email" value={orgData.email} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="org_name" className="block text-sm font-medium text-gray-700">Organization Name</label>
                        <input type="text" id="org_name" name="org_name" value={orgData.org_name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="organization_type" className="block text-sm font-medium text-gray-700">Organization Type</label>
                        <input type="text" id="organization_type" name="organization_type" value={orgData.organization_type} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                        <input type="text" id="address" name="address" value={orgData.address} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input type="text" id="phone_number" name="phone_number" value={orgData.phone_number} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
                        <input type="url" id="website" name="website" value={orgData.website} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="gst_number" className="block text-sm font-medium text-gray-700">GST Number</label>
                        <input type="text" id="gst_number" name="gst_number" value={orgData.gst_number} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                        <input type="text" id="country" name="country" value={orgData.country} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="country_code" className="block text-sm font-medium text-gray-700">Country Code</label>
                        <input type="text" id="country_code" name="country_code" value={orgData.country_code} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                        <input type="text" id="state" name="state" value={orgData.state} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="form-group md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="description" name="description" rows={3} value={orgData.description} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
                    </div>
                </div>
            );
        } else {
            const userData = formData as UserData;
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" id="email" name="email" value={userData.email || ''} readOnly className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="official_email" className="block text-sm font-medium text-gray-700">Official Email</label>
                        <input type="email" id="official_email" name="official_email" value={userData.official_email || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
                        <input type="text" id="first_name" name="first_name" value={userData.first_name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input type="text" id="last_name" name="last_name" value={userData.last_name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="department_name" className="block text-sm font-medium text-gray-700">Department</label>
                        <input type="text" id="department_name" name="department_name" value={userData.department_name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="mobile_number" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                        <input type="text" id="mobile_number" name="mobile_number" value={userData.mobile_number || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <input type="date" id="date_of_birth" name="date_of_birth" value={userData.date_of_birth || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                        <input type="text" id="address" name="address" value={userData.address || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                        <input type="text" id="gender" name="gender" value={userData.gender || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="marital_status" className="block text-sm font-medium text-gray-700">Marital Status</label>
                        <input type="text" id="marital_status" name="marital_status" value={userData.marital_status || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="employee_type" className="block text-sm font-medium text-gray-700">Employee Type</label>
                        <input type="text" id="employee_type" name="employee_type" value={userData.employee_type || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="joining_date" className="block text-sm font-medium text-gray-700">Joining Date</label>
                        <input type="date" id="joining_date" name="joining_date" value={userData.joining_date || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="working_days" className="block text-sm font-medium text-gray-700">Working Days</label>
                        <input type="text" id="working_days" name="working_days" value={userData.working_days || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="slack_id" className="block text-sm font-medium text-gray-700">Slack ID</label>
                        <input type="text" id="slack_id" name="slack_id" value={userData.slack_id || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="github_id" className="block text-sm font-medium text-gray-700">GitHub ID</label>
                        <input type="text" id="github_id" name="github_id" value={userData.github_id || ''} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="container mx-auto p-8">
            <h2 className="text-3xl font-bold mb-6 text-blue-600 flex items-center gap-2">
                {isSuperAdmin ? <FaBuilding /> : <FaUser />}
                {isSuperAdmin ? 'Your Organization Profile' : 'Your User Profile'}
            </h2>
            <div className="bg-white rounded-lg p-6 shadow-lg mb-6">
                <div className="flex flex-col gap-2">
                    <p className="text-gray-700">
                        <span className="font-semibold">Email:</span> {user?.email}
                    </p>
                    <p className="text-gray-700 capitalize">
                        <span className="font-semibold">Role Type:</span> {user?.role_type?.replace('_', ' ')}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
                {renderForm()}
                <div className="mt-6 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <FaTimesCircle className="h-5 w-5 mr-2" />
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                    >
                        {isSubmitting ? (
                            <>
                                <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <FaSave className="-ml-1 mr-3 h-5 w-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}