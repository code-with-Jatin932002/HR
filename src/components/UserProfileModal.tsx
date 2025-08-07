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
    id: string;
    org_name: string;
    email: string;
    // Removed role_type here, as it's typically a user property, not an organization property
    address: string;
    phone_number: string;
    industry: string; // Your response has 'organization_type', mapping it to 'industry'
    description: string;
    website: string;
    gst_number: string;
    // Add original organization_type if it helps debugging or for other uses
    organization_type: string;
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
            console.log("Current user object:", user);
            console.log("User role_type:", user?.role_type);
            console.log("User organization_id:", user?.organization_id);

            // Normalize role_type to lowercase for consistent comparison
            const userRoleType = user?.role_type?.toLowerCase();
            const isSuperAdmin = userRoleType === 'super_admin';

            // IMPORTANT: If user.organization_id is the concatenated string, you MUST parse it here.
            // For example, if the UUID is always at the very beginning of the concatenated string:
            // const orgId = user?.organization_id?.split('organization_address')[0] || user?.organization_id;
            // Or if you know a specific pattern. For now, assuming it's a direct UUID.
            const orgId = user?.organization_id;


            if (isSuperAdmin && typeof orgId === 'string' && orgId) {
                setFetchingOrgDetails(true);
                try {
                    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
                    const token = sessionStorage.getItem('token');

                    if (!token) {
                        console.error("UserProfileModal: No token found for fetching organization details.");
                        MySwal.fire('Error', 'Authentication token missing.', 'error');
                        return; // Stop execution if token is missing
                    }

                    const apiUrl = `${baseUrl}/organization/${orgId}`;
                    console.log("UserProfileModal: Fetching organization details from URL:", apiUrl);

                    const response = await callApi('get', apiUrl, null, {
                        Authorization: `Bearer ${token}`,
                    });

                    // --- Critical Debugging Section ---
                    console.log("Raw response from callApi:", response);
                    console.log("Type of response:", typeof response);

                    let apiData: any = response; // Assume response is directly the data or an object containing data

                    // If callApi returns an Axios-like response object, access .data
                    if (response && typeof response === 'object' && 'data' in response && response.data !== undefined) {
                        apiData = response.data;
                        console.log("Accessed response.data:", apiData);
                    } else {
                         console.log("response does not have a .data property or it's undefined. Using response directly as data.");
                    }
                    // --- End Critical Debugging Section ---


                    if (apiData && typeof apiData === 'object' && Object.keys(apiData).length > 0) {
                        // Ensure the structure matches OrgDataForDisplay
                        setOrganizationDetails({
                            id: apiData.id || '',
                            org_name: apiData.org_name || 'N/A',
                            email: apiData.email || 'N/A', // Email from org data
                            address: apiData.address || 'N/A',
                            phone_number: apiData.phone_number || 'N/A',
                            industry: apiData.organization_type || 'N/A', // Map organization_type to industry
                            description: apiData.description || 'N/A',
                            website: apiData.website || 'N/A',
                            gst_number: apiData.gst_number || 'N/A',
                            organization_type: apiData.organization_type || 'N/A', // Keep original for reference
                        });
                        // Clear the "No organization details found." alert if it was shown previously
                        MySwal.close();
                        console.log("Organization details set successfully.");
                    } else {
                        console.warn("UserProfileModal: Organization API returned no valid data (empty object or null).");
                        MySwal.fire('Info', 'No organization details found.', 'info');
                    }
                } catch (error: any) {
                    console.error("UserProfileModal: Failed to fetch organization details:", error);
                    let errorMessage = 'Failed to fetch organization details.';
                    if (error.response && error.response.data && error.response.data.detail) {
                        errorMessage = error.response.data.detail;
                    } else if (error.message) {
                        errorMessage = error.message;
                    }
                    MySwal.fire('Error', errorMessage, 'error');
                } finally {
                    setFetchingOrgDetails(false);
                    console.log("UserProfileModal: Finished fetching organization details.");
                }
            } else {
                console.log("UserProfileModal: User is not super_admin, or organization_id is missing/invalid. Not fetching organization details.");
                setOrganizationDetails(null); // Ensure no old data is shown
                setFetchingOrgDetails(false);
                // No Swal alert here, as it's an expected condition for non-super_admin users
            }
        };

        // Only run fetchOrganizationData if the modal is actively being opened (i.e., user is not null)
        // and only on initial render or when user object genuinely changes its content.
        fetchOrganizationData();

        // Cleanup function: Clear organization details when the modal closes or user changes
        return () => {
            setOrganizationDetails(null);
        };
    }, [user]); // Dependency array: re-run this effect if the 'user' object changes

    // Added a check here to prevent rendering the modal content before 'user' is available
    if (!user) {
        return null; // Or render a simple loading skeleton for the modal itself
    }

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

                {/* Organization Details section, only shown for super_admin. */}
                {user?.role_type?.toLowerCase() === 'super_admin' && (
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
                                {/* Only display fields that are relevant for organization details and not already displayed as user info */}
                                {Object.entries(organizationDetails)
                                    .filter(([key]) => !['id', 'password', 'role_type', 'email', 'organization_type'].includes(key)) // 'organization_type' is now mapped to 'industry'
                                    .map(([key, value]) => (
                                        <div key={key} className="flex text-sm">
                                            <span className="font-semibold capitalize w-32 min-w-[120px]">{key.replace(/_/g, ' ')}:</span>
                                            <span className="break-words flex-1">{String(value)}</span>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <p className="text-red-500">
                                {user?.organization_id ? "Could not load organization details. Please check your network or the API response format." : "No organization details available for this user."}
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