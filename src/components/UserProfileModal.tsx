// components/UserProfileModal.tsx
'use client'; 

import React, { useState, useEffect } from 'react';
import { FaBuilding, FaInfoCircle, FaSpinner } from 'react-icons/fa';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import callApi from '@/utils/callApi'; // Adjust this path if your callApi utility is elsewhere
import { UserData } from '../context/AuthContext'; // Adjust this path if your AuthContext is elsewhere

const MySwal = withReactContent(Swal);

interface OrgDataForDisplay {
    id: string; // The ID is useful, but we won't display it directly
    org_name: string;
    address: string;
    phone_number: string;
    industry: string;
    description: string;
    website: string;
    gst_number: string;
    // Add any other fields your API returns that you want to display.
    // Explicitly exclude 'password' here.
}

interface UserProfileModalProps {
    user: UserData | null; // The user object from AuthContext
    onClose: () => void; // Callback to close the modal
}

export default function UserProfileModal({ user, onClose }: UserProfileModalProps) {
    const [organizationDetails, setOrganizationDetails] = useState<OrgDataForDisplay | null>(null);
    const [fetchingOrgDetails, setFetchingOrgDetails] = useState(false);

    useEffect(() => {
        const fetchOrganizationData = async () => {
            console.log("UserProfileModal: Attempting to fetch organization data.");
            // Only fetch organization details if user is super_admin and organization_id exists
            if (user?.role_type === 'super_admin' && typeof user?.organization_id === 'string' && user.organization_id) {
                setFetchingOrgDetails(true);
                try {
                    const baseUrl = process.env.NEXT_PUBLIC_API_URL; // Ensure this env variable is set
                    // const token = localStorage.getItem('token'); // Get the auth token from local storage
                    const token = sessionStorage.getItem('token');


                    if (!token) {
                        console.error("UserProfileModal: No token found for fetching organization details.");
                        MySwal.fire('Error', 'Authentication token missing.', 'error');
                        return;
                    }

                    const orgId = user.organization_id;
                    const apiUrl = `${baseUrl}/organization/${orgId}`;
                    console.log("UserProfileModal: Fetching organization details from:", apiUrl);

                    // Use your callApi utility to make the GET request
                    const response = await callApi('get', apiUrl, null, {
                        Authorization: `Bearer ${token}`, // Include the Bearer token for authentication
                    });

                    console.log("UserProfileModal: Organization API response data:", response.data);
                    if (response.data) {
                        // Assuming response.data is directly the OrgDataForDisplay object
                        setOrganizationDetails(response.data);
                    } else {
                        console.warn("UserProfileModal: Organization API returned no data.");
                        MySwal.fire('Info', 'No organization details found.', 'info');
                    }
                } catch (error: any) {
                    console.error("UserProfileModal: Failed to fetch organization details:", error);
                    const errorMessage = error?.response?.data?.detail || 'Failed to fetch organization details.';
                    MySwal.fire('Error', errorMessage, 'error');
                } finally {
                    setFetchingOrgDetails(false); // End loading
                    console.log("UserProfileModal: Finished fetching organization details.");
                }
            } else {
                console.log("UserProfileModal: User is not super_admin or organization_id is missing/invalid. Not fetching organization details.");
                setOrganizationDetails(null); // Clear any previous details if conditions aren't met
                setFetchingOrgDetails(false); // Ensure loading is off
            }
        };

        // Call the fetch function when the modal is opened and user data is available
        // The modal itself is only rendered if `showProfileModal` is true in Navbar.tsx
        fetchOrganizationData();

        // Cleanup function: Clear organization details when the modal closes
        return () => {
            setOrganizationDetails(null);
        };
    }, [user]); // Dependency array: re-run this effect if the 'user' object changes

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative space-y-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-2xl font-bold mb-4 text-blue-600 flex items-center gap-2">
                    <FaInfoCircle /> Your Profile
                </h3>
                <div className="flex flex-col gap-2 border-b pb-4 border-gray-200">
                    <p className="text-gray-700">
                        <span className="font-semibold">Email:</span> {user?.email}
                    </p>
                    <p className="text-gray-700 capitalize">
                        <span className="font-semibold">Role Type:</span> {user?.role_type?.replace('_', ' ')}
                    </p>
                </div>

                {/* Organization Details section, only shown for super_admin */}
                {user?.role_type === 'super_admin' && (
                    <div className="mt-4 pt-4">
                        <h4 className="text-xl font-bold mb-3 flex items-center gap-2 text-blue-600">
                            <FaBuilding /> Organization Details
                        </h4>
                        {fetchingOrgDetails ? (
                            <div className="flex items-center justify-center py-4">
                                <FaSpinner className="animate-spin text-blue-500 text-3xl mr-2" />
                                <p className="text-gray-600">Loading organization details...</p>
                            </div>
                        ) : organizationDetails ? (
                            <div className="space-y-2 text-gray-800">
                                {/* Iterate over organization details and display them */}
                                {Object.entries(organizationDetails)
                                    .filter(([key]) => key !== 'id' && key !== 'password') // Exclude 'id' and 'password' from display
                                    .map(([key, value]) => (
                                        <div key={key} className="flex text-sm">
                                            <span className="font-semibold capitalize w-32 min-w-[120px]">{key.replace(/_/g, ' ')}:</span>
                                            <span className="break-words flex-1">{String(value)}</span>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <p className="text-red-500">
                                {user?.organization_id ? "Could not load organization details. Please check the API response." : "No organization details available for this user."}
                            </p>
                        )}
                    </div>
                )}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-black text-2xl"
                    aria-label="Close profile modal"
                >
                    &times;
                </button>
            </div>
        </div>
    );
}