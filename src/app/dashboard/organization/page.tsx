'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMemo, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { FiSearch, FiX } from 'react-icons/fi'; // Import search icons

import callApi from '@/utils/callApi';
import ActionButtons from '@/components/ActionButtons';
import Table from '@/components/Table'; // Ensure Table.tsx is updated as well
import Loader from '@/components/Loader';
import Button from '@/components/Button';
import Pagination from '@/components/Pagination';
import useProtectRoute from '@/hooks/useProtectRoute';

const MySwal = withReactContent(Swal);

// Define the HttpMethod type to explicitly list allowed methods for callApi
type HttpMethod = 'get' | 'post' | 'put' | 'delete';

/**
 * Interface defining the complete structure of an Organization object.
 * 'id' is a string (UUID).
 * 'role_type' is now optional for updates.
 */
interface OrgData {
  id: string;
  org_name: string;
  email: string;
  password?: string; // Optional for update, but required for creation (if it were implemented here)
  address: string;
  phone_number: string;
  organization_type: string;
  role_type?: string; // Made optional for updates
  description: string;
  website: string;
  gst_number: string;
}

// Fields used in the form for mapping values.
// 'role_type' has been removed from this array.
const fields: (keyof Omit<OrgData, 'id' | 'role_type'>)[] = [
  'org_name',
  'email',
  'password',
  'address',
  'phone_number',
  'organization_type',
  'description',
  'website',
  'gst_number',
];

// Table columns definition (unchanged as per your original request)
const columns = [
  { label: 'Name', key: 'org_name' },
  { label: 'Phone', key: 'phone_number' },
  { label: 'Website', key: 'website' },
];

/**
 * Async function to fetch organizations with pagination and search parameters.
 * @param queryKey - Contains current page, items per page, and search term for API call.
 * @returns A promise that resolves to the paginated response data.
 */
const fetchOrganizations = async ({ queryKey }: { queryKey: any[] }) => {
  const [_key, currentPage, itemsPerPage, searchQuery] = queryKey;
  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('Authentication token not found.');
  }
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  let url = `${baseUrl}/organization?page=${currentPage}&limit=${itemsPerPage}`;

  if (searchQuery) {
    url += `&search=${encodeURIComponent(searchQuery)}`;
  }

  const response = await callApi('get', url, null, {
    Authorization: `Bearer ${token}`,
  });
  // Return the full response object, which should contain organizations array AND pagination metadata
  return response;
};

export default function OrganizationPage() {
  useProtectRoute(); // Ensures the route is protected

  // State for form and modals
  const [formOpen, setFormOpen] = useState(false);
  const [viewOrg, setViewOrg] = useState<OrgData | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null); // Stores the ID of the org being updated
  const [isSubmittingForm, setIsSubmittingForm] = useState(false); // Loader for form submission
  // Changed isDeleting to show a loading state for the delete action itself, not a full-page loader
  const [deletingOrgId, setDeletingOrgId] = useState<string | null>(null);

  // State for pagination and search
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Standard items per page
  const [searchQuery, setSearchQuery] = useState(''); // New state for search query

  // Authentication token from session storage
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;

  const queryClient = useQueryClient(); // React Query client for invalidating/refetching queries

  // Fetch organizations data with React Query, triggering refetch on page/limit/search changes
  const { data: orgsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['organizations', currentPage, itemsPerPage, searchQuery], // Query key includes search parameter
    queryFn: fetchOrganizations, // Function to call for data fetching
    placeholderData: (previousData) => previousData, // Keep previous data visible while loading new page
    refetchOnWindowFocus: false, // Prevents automatic refetch on window focus
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
  });

  // Extract relevant data from the query response for the table and pagination
  const organizations = orgsData?.organizations || [];
  const totalItems = orgsData?.totalItems || 0;
  const totalPages = orgsData?.totalPages || 1; // Default to 1 page if no data

  // Validation schema for the update form
  const validationSchema = useMemo(() => {
    return Yup.object({
      org_name: Yup.string().required('Organization name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      // Password is not required for update unless user explicitly enters it.
      password: Yup.string().min(6, 'Password must be at least 6 characters').notRequired(),
      address: Yup.string().required('Address is required'),
      phone_number: Yup.string().required('Phone number is required'),
      organization_type: Yup.string().required('Organization type is required'),
      description: Yup.string().required('Description is required'),
      website: Yup.string().url('Invalid URL').required('Website is required'),
      gst_number: Yup.string().required('GST Number is required'),
    });
  }, []);

  // Formik hook for managing form state, validation, and submission
  const formik = useFormik<Omit<OrgData, 'id' | 'role_type'>>({
    initialValues: {
      org_name: '',
      email: '',
      password: '',
      address: '',
      phone_number: '',
      organization_type: '',
      description: '',
      website: '',
      gst_number: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      // This onSubmit is specifically for UPDATE operations based on the original code
      if (!selectedOrgId) return; // Should not happen if flow is correct (update only)

      setIsSubmittingForm(true); // Start form loader
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const url = `${baseUrl}/organization/${selectedOrgId}`;
        const method: HttpMethod = 'put'; // Explicitly type method as 'put'

        await callApi(method, url, values, {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        });

        await MySwal.fire({
          icon: 'success',
          title: 'Organization updated successfully!',
          timer: 1500,
          showConfirmButton: false,
        });

        resetForm(); // Reset form fields
        setFormOpen(false); // Close the form modal
        setSelectedOrgId(null); // Clear the selected organization ID
        refetch(); // Re-fetch data to reflect the update
      } catch (error: any) {
        MySwal.fire('Error', error?.response?.data?.detail || 'Update failed', 'error');
      } finally {
        setIsSubmittingForm(false); // Stop form loader
      }
    },
  });

  /**
   * Handles deleting an organization after confirmation.
   * @param orgId - The ID of the organization to delete.
   */
  const handleDelete = async (orgId: string) => {
    if (!orgId) return; // Ensure an ID exists

    const confirm = await MySwal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this organization!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (confirm.isConfirmed) {
      setDeletingOrgId(orgId); // Set the ID of the organization being deleted to show a loader on that specific row
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        await callApi('delete', `${baseUrl}/organization/${orgId}`, null, {
          Authorization: `Bearer ${token}`,
        });

        MySwal.fire('Deleted!', 'Organization deleted.', 'success');
        refetch(); // Re-fetch data to update the table
      } catch (error: any) {
        MySwal.fire('Error', error?.response?.data?.detail || 'Delete failed', 'error');
      } finally {
        setDeletingOrgId(null); // Stop the specific delete loader
      }
    }
  };

  /**
   * Handles updating an organization: sets the selected ID and populates the form.
   * @param org - The organization data to pre-fill the form with.
   */
  const handleUpdate = (org: OrgData) => {
    setSelectedOrgId(org.id); // Set the ID for the update operation
    formik.setValues({ // Populate all form fields from the organization data
      org_name: org.org_name,
      email: org.email,
      password: '', // Password field is cleared for security; user must re-enter to change.
      address: org.address,
      phone_number: org.phone_number,
      organization_type: org.organization_type,
      description: org.description,
      website: org.website,
      gst_number: org.gst_number,
    });
    setFormOpen(true); // Open the form modal
  };

  /**
   * Handles viewing organization details in a read-only modal.
   * @param org - The organization data to display.
   */
  const handleView = (org: OrgData) => {
    setViewOrg(org); // Set the organization data for the view modal
    setShowViewModal(true); // Show the view modal
  };

  /**
   * Callback to update the current page, triggering a new API call for organizations.
   * Memoized to prevent unnecessary re-renders of the Pagination component.
   * @param page - The new page number.
   */
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  /**
   * Handles changes to the search input.
   * @param e - The change event from the input.
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  /**
   * Clears the search query.
   */
  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1); // Reset to first page when clearing search
  };

  // Use a conditional check for the initial load and display the loader
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Error state for initial data fetch (if any)
  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-red-500">
        <p>Failed to load organizations. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6">Organizations</h2>

        {/* Search Box for Organizations */}
        <div className="w-full px-4 py-3">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <FiSearch />
            </span>
            <input
              type="text"
              placeholder="Search by organization name or email..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500"
              >
                <FiX />
              </button>
            )}
          </div>
        </div>

        {/* View Modal */}
        {showViewModal && viewOrg && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative space-y-3">
              <h3 className="text-xl font-semibold mb-4">🏢 Organization Details</h3>
              {/* Filter out 'id', 'is_active', 'password', and 'role_type' from the view */}
              {Object.entries(viewOrg)
                .filter(([key]) => key !== 'id' && key !== 'is_active' && key !== 'password' && key !== 'role_type')
                .map(([key, value]) => (
                  <div key={key} className="flex text-sm">
                    {/* Format key for display (e.g., 'org_name' -> 'Org Name') */}
                    <span className="font-bold capitalize w-32">{key.replace(/_/g, ' ')}:</span>
                    <span>{String(value)}</span>
                  </div>
                ))}
              <button
                onClick={() => setShowViewModal(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
              >
                ✖
              </button>
            </div>
          </div>
        )}

        {/* Update Form Modal */}
        {formOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
            <div className="bg-white rounded-lg w-full max-w-lg shadow-lg relative">
              {isSubmittingForm && ( // Loader specific to form submission
                <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg bg-white bg-opacity-80">
                  <Loader />
                </div>
              )}
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <h3 className="text-xl font-semibold mb-4">Update Organization</h3>
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                  {fields.map((field) => {
                    const typedField = field as keyof typeof formik.values;
                    return (
                      <div key={field}>
                        <label className="block mb-1 capitalize">{field.replace(/_/g, ' ')}</label>
                        <input
                          type={
                            field === 'password' ? 'password' :
                              field === 'email' ? 'email' :
                                field === 'phone_number' ? 'tel' : 'text'
                          }
                          name={field}
                          value={formik.values[typedField] || ''}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="w-full border rounded py-2 px-3 text-black outline-none focus:border-blue-500"
                          disabled={isSubmittingForm} // Disable input during submission
                        />
                        {formik.touched[typedField] && formik.errors[typedField] && (
                          <span className="text-sm text-red-500">{formik.errors[typedField]}</span>
                        )}
                      </div>
                    );
                  })}
                  <div className="flex justify-between mt-4">
                    {/* Cancel Button */}
                    <Button
                      type="button"
                      label="Cancel"
                      onClick={() => {
                        setFormOpen(false);
                        setSelectedOrgId(null); // Clear selected ID on cancel
                        formik.resetForm(); // Reset form when canceled
                      }}
                      variant="secondary"
                      disabled={isSubmittingForm}
                    />
                    {/* Update Button */}
                    <Button
                      type="submit"
                      label="Update Organization"
                      variant="primary"
                      disabled={isSubmittingForm}
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Organizations Table */}
        <Table
          columns={columns}
          data={organizations} // Table receives only the current page's data
          currentPage={currentPage} // ADDED: Pass currentPage
          itemsPerPage={itemsPerPage} // ADDED: Pass itemsPerPage
          actions={(org: OrgData) => (
            <div className="relative"> {/* Add a relative container for positioning the loader */}
              <ActionButtons
                onView={() => handleView(org)}
                onUpdate={() => handleUpdate(org)}
                onDelete={() => org?.id && handleDelete(org.id)} // Ensure org.id exists before calling handleDelete
              />
              {deletingOrgId === org.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
                  <Loader />
                </div>
              )}
            </div>
          )}
        />

        {/* Pagination Controls */}
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}