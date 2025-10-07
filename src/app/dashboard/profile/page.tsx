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

// Define the new consistent input class
const INPUT_STYLE = `
  w-full rounded-lg border border-gray-300 py-4 pl-6 pr-10 text-black outline-none transition duration-300
  focus:border-purple-600
`;

// Define the read-only input class based on the new style
const READONLY_INPUT_STYLE = `
  ${INPUT_STYLE} bg-gray-100 cursor-not-allowed text-gray-500
`;

// Define the label class based on the new style
const LABEL_STYLE = 'mb-2.5 block text-sm font-medium text-black';

// Define a type for elements that have name and value (for the TypeScript fix)
type InputChangeTarget = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

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

    // FIX: Apply type assertion to resolve the 'name' and 'value' destructuring error
    const handleChange = (e: React.ChangeEvent<InputChangeTarget>) => {
        // Explicitly assert the type of e.target to ensure 'name' and 'value' exist
        const target = e.target as InputChangeTarget;
        const { name, value } = target;
        
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
                <FaSpinner className="animate-spin text-purple-500 text-5xl mr-2" />
                <p className="text-gray-600">Loading profile...</p>
            </div>
        );
    }

    const renderForm = () => {
        if (isSuperAdmin) {
            const orgData = formData as OrgData;
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Organization Fields (Super Admin) - All inputs use the new style */}
                    <div className="form-group">
                        <label htmlFor="email" className={LABEL_STYLE}>Email</label>
                        <input type="email" id="email" name="email" value={orgData.email} readOnly className={READONLY_INPUT_STYLE} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="org_name" className={LABEL_STYLE}>Organization Name</label>
                        <input type="text" id="org_name" name="org_name" value={orgData.org_name} onChange={handleChange} className={INPUT_STYLE} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="organization_type" className={LABEL_STYLE}>Organization Type</label>
                        <input type="text" id="organization_type" name="organization_type" value={orgData.organization_type} readOnly className={READONLY_INPUT_STYLE} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="address" className={LABEL_STYLE}>Address</label>
                        <input type="text" id="address" name="address" value={orgData.address} onChange={handleChange} className={INPUT_STYLE} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone_number" className={LABEL_STYLE}>Phone Number</label>
                        <input type="text" id="phone_number" name="phone_number" value={orgData.phone_number} onChange={handleChange} className={INPUT_STYLE} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="website" className={LABEL_STYLE}>Website</label>
                        <input type="url" id="website" name="website" value={orgData.website} onChange={handleChange} className={INPUT_STYLE} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="gst_number" className={LABEL_STYLE}>GST Number</label>
                        <input type="text" id="gst_number" name="gst_number" value={orgData.gst_number} readOnly className={READONLY_INPUT_STYLE} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="country" className={LABEL_STYLE}>Country</label>
                        <input type="text" id="country" name="country" value={orgData.country} onChange={handleChange} className={INPUT_STYLE} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="country_code" className={LABEL_STYLE}>Country Code</label>
                        <input type="text" id="country_code" name="country_code" value={orgData.country_code} onChange={handleChange} className={INPUT_STYLE} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="state" className={LABEL_STYLE}>State</label>
                        <input type="text" id="state" name="state" value={orgData.state} onChange={handleChange} className={INPUT_STYLE} />
                    </div>
                    <div className="form-group md:col-span-2">
                        <label htmlFor="description" className={LABEL_STYLE}>Description</label>
                        <textarea id="description" name="description" rows={3} value={orgData.description} onChange={handleChange} className={`${INPUT_STYLE} min-h-[100px]`}></textarea>
                    </div>
                </div>
            );
        } else {
            const userData = formData as UserData;
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* User Fields (Employee) - Styles applied, and requested fields set to readOnly */}
                    <div className="form-group">
                        <label htmlFor="email" className={LABEL_STYLE}>Email</label>
                        <input type="email" id="email" name="email" value={userData.email || ''} readOnly className={READONLY_INPUT_STYLE} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="official_email" className={LABEL_STYLE}>Official Email</label>
                        <input type="email" id="official_email" name="official_email" value={userData.official_email || ''} onChange={handleChange} className={INPUT_STYLE} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="first_name" className={LABEL_STYLE}>First Name</label>
                        <input type="text" id="first_name" name="first_name" value={userData.first_name} onChange={handleChange} className={INPUT_STYLE} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="last_name" className={LABEL_STYLE}>Last Name</label>
                        <input type="text" id="last_name" name="last_name" value={userData.last_name} onChange={handleChange} className={INPUT_STYLE} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="department_name" className={LABEL_STYLE}>Department</label>
                        {/* READ-ONLY as requested */}
                        <input type="text" id="department_name" name="department_name" value={userData.department_name} readOnly className={READONLY_INPUT_STYLE} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="mobile_number" className={LABEL_STYLE}>Mobile Number</label>
                        <input type="text" id="mobile_number" name="mobile_number" value={userData.mobile_number || ''} onChange={handleChange} className={INPUT_STYLE} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="date_of_birth" className={LABEL_STYLE}>Date of Birth</label>
                        <input type="date" id="date_of_birth" name="date_of_birth" value={userData.date_of_birth || ''} onChange={handleChange} className={INPUT_STYLE} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="address" className={LABEL_STYLE}>Address</label>
                        <input type="text" id="address" name="address" value={userData.address || ''} onChange={handleChange} className={INPUT_STYLE} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="gender" className={LABEL_STYLE}>Gender</label>
                        <input type="text" id="gender" name="gender" value={userData.gender || ''} onChange={handleChange} className={INPUT_STYLE} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="marital_status" className={LABEL_STYLE}>Marital Status</label>
                        <input type="text" id="marital_status" name="marital_status" value={userData.marital_status || ''} onChange={handleChange} className={INPUT_STYLE} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="employee_type" className={LABEL_STYLE}>Employee Type</label>
                        <input type="text" id="employee_type" name="employee_type" value={userData.employee_type || ''} onChange={handleChange} className={INPUT_STYLE} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="joining_date" className={LABEL_STYLE}>Joining Date</label>
                        {/* READ-ONLY as requested */}
                        <input type="date" id="joining_date" name="joining_date" value={userData.joining_date || ''} readOnly className={READONLY_INPUT_STYLE} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="working_days" className={LABEL_STYLE}>Working Days</label>
                        <input type="text" id="working_days" name="working_days" value={userData.working_days || ''} onChange={handleChange} className={INPUT_STYLE} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="slack_id" className={LABEL_STYLE}>Slack ID</label>
                        {/* READ-ONLY as requested */}
                        <input type="text" id="slack_id" name="slack_id" value={userData.slack_id || ''} readOnly className={READONLY_INPUT_STYLE} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="github_id" className={LABEL_STYLE}>GitHub ID</label>
                        <input type="text" id="github_id" name="github_id" value={userData.github_id || ''} onChange={handleChange} className={INPUT_STYLE} />
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="container mx-auto p-8">
            <h2 className="text-3xl font-bold mb-6 text-purple-500 flex items-center gap-2">
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
                
                {/* Updated Button Group Styling: One line, aligned right */}
                <div className="mt-8 flex justify-end gap-4"> 
                    
                    {/* Cancel Button (Secondary/Gray) */}
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        // Horizontal style applied: px-6 py-3, no w-full
                        className="cursor-pointer rounded-lg border border-gray-400 bg-gray-500 px-6 py-3 text-white font-semibold transition hover:bg-gray-600 hover:border-gray-600 disabled:bg-gray-400 disabled:border-gray-400 flex items-center justify-center min-w-[120px]" 
                    >
                        <FaTimesCircle className="h-5 w-5 mr-2 text-white" />
                        Cancel
                    </button>

                    {/* Save Changes Button (Primary/Purple) */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        // Horizontal style applied: px-6 py-3, no w-full
                        className="cursor-pointer rounded-lg border border-purple-600 bg-purple-600 px-6 py-3 text-white font-semibold transition hover:bg-purple-700 hover:border-purple-700 disabled:bg-gray-400 disabled:border-gray-400 flex items-center justify-center min-w-[150px]"
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