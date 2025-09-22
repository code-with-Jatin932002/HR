// app/dashboard/profile/page.tsx or components/UpdateProfilePage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { FaBuilding, FaSpinner, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import callApi from '@/utils/callApi'; // Adjust the path
import { useAuth } from '@/context/AuthContext'; // Assuming you have a useAuth hook to get user data

const MySwal = withReactContent(Swal);

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
}

export default function UpdateProfilePage() {
    const { user } = useAuth(); // Get user from your AuthContext
    const [formData, setFormData] = useState<OrgData>({
        org_name: '',
        email: '',
        address: '',
        phone_number: '',
        organization_type: '',
        description: '',
        website: '',
        gst_number: '',
        country: '',
        country_code: '',
        state: '',
    });
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orgId, setOrgId] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrganizationData = async () => {
            const userRoleType = user?.role_type?.toLowerCase();
            const orgIdFromUser = user?.organization_id;

            if (userRoleType === 'super_admin' && orgIdFromUser) {
                setOrgId(orgIdFromUser);
                const baseUrl = process.env.NEXT_PUBLIC_API_URL;
                const token = sessionStorage.getItem('token');

                if (!token) {
                    MySwal.fire('Error', 'Authentication token missing.', 'error');
                    setLoading(false);
                    return;
                }

                try {
                    const apiUrl = `${baseUrl}/organization/${orgIdFromUser}`;
                    const response = await callApi('get', apiUrl, null, {
                        Authorization: `Bearer ${token}`,
                    });

                    const apiData = response.data || response;

                    if (apiData) {
                        setFormData(apiData); // Pre-fill the form with fetched data
                    } else {
                        MySwal.fire('Info', 'No organization details found.', 'info');
                    }
                } catch (error: any) {
                    console.error("Failed to fetch organization details:", error);
                    MySwal.fire('Error', 'Failed to load profile data.', 'error');
                } finally {
                    setLoading(false);
                }
            } else {
                MySwal.fire('Access Denied', 'You do not have permission to view this page.', 'error');
                setLoading(false);
            }
        };

        if (user) {
            fetchOrganizationData();
        }
    }, [user]); // Re-run effect if user data changes

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const token = sessionStorage.getItem('token');

        if (!token || !orgId) {
            MySwal.fire('Error', 'Missing token or organization ID.', 'error');
            setIsSubmitting(false);
            return;
        }

        try {
            // The PUT API expects the org_id as a parameter, so we don't include it in the body.
            const dataToUpdate = { ...formData };
            // Optional: you can remove fields from the payload if the API doesn't accept them.
            // delete dataToUpdate.email; // If the API doesn't allow email updates.

            const apiUrl = `${baseUrl}/organization/${orgId}`;
            await callApi('put', apiUrl, dataToUpdate, {
                Authorization: `Bearer ${token}`,
            });

            MySwal.fire('Success', 'Profile updated successfully!', 'success');
        } catch (error: any) {
            console.error("Failed to update profile:", error);
            const errorMessage = error.response?.data?.detail || 'Failed to update profile. Please try again.';
            MySwal.fire('Error', errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <FaSpinner className="animate-spin text-blue-500 text-5xl mr-2" />
                <p className="text-gray-600">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8">
            <h2 className="text-3xl font-bold mb-6 text-blue-600 flex items-center gap-2">
                <FaBuilding /> Update Organization Profile
            </h2>
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Organization Name */}
                    <div className="form-group">
                        <label htmlFor="org_name" className="block text-sm font-medium text-gray-700">Organization Name</label>
                        <input
                            type="text"
                            id="org_name"
                            name="org_name"
                            value={formData.org_name}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    {/* Email - Note: You might not want to make this editable based on your API */}
                    <div className="form-group">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed"
                            disabled // Often, emails shouldn't be updated this way
                        />
                    </div>
                    {/* Address */}
                    <div className="form-group">
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    {/* Phone Number */}
                    <div className="form-group">
                        <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="text"
                            id="phone_number"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    {/* Organization Type */}
                    <div className="form-group">
                        <label htmlFor="organization_type" className="block text-sm font-medium text-gray-700">Organization Type</label>
                        <input
                            type="text"
                            id="organization_type"
                            name="organization_type"
                            value={formData.organization_type}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    {/* Website */}
                    <div className="form-group">
                        <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
                        <input
                            type="url"
                            id="website"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    {/* GST Number */}
                    <div className="form-group">
                        <label htmlFor="gst_number" className="block text-sm font-medium text-gray-700">GST Number</label>
                        <input
                            type="text"
                            id="gst_number"
                            name="gst_number"
                            value={formData.gst_number}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    {/* Country */}
                    <div className="form-group">
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                        <input
                            type="text"
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    {/* Country Code */}
                    <div className="form-group">
                        <label htmlFor="country_code" className="block text-sm font-medium text-gray-700">Country Code</label>
                        <input
                            type="text"
                            id="country_code"
                            name="country_code"
                            value={formData.country_code}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    {/* State */}
                    <div className="form-group">
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                        <input
                            type="text"
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    {/* Description - Full width */}
                    <div className="form-group md:col-span-2">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            rows={3}
                            value={formData.description}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                        ></textarea>
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
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