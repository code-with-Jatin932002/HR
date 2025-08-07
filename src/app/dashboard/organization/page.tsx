'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMemo, useState, useCallback, useEffect } from 'react'; // Import useEffect
import toast from 'react-hot-toast'; // Import react-hot-toast
import { FiSearch, FiX } from 'react-icons/fi'; // Import search icons

import callApi from '@/utils/callApi';
import ActionButtons from '@/components/ActionButtons';
import Table from '@/components/Table';
import Loader from '@/components/Loader';
import Button from '@/components/Button';
import Pagination from '@/components/Pagination';
import useProtectRoute from '@/hooks/useProtectRoute';

type HttpMethod = 'get' | 'post' | 'put' | 'delete';

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

// Function to fetch a list of organizations
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
  return response;
};

// NEW: Function to fetch a single organization by ID
const fetchSingleOrganization = async ({ queryKey }: { queryKey: any[] }) => {
  const [_key, orgId] = queryKey;
  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('Authentication token not found.');
  }
  if (!orgId) {
    throw new Error('Organization ID is required to fetch details.');
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const url = `${baseUrl}/organization/${orgId}`;

  const response = await callApi('get', url, null, {
    Authorization: `Bearer ${token}`,
  });
  return response;
};

export default function OrganizationPage() {
  useProtectRoute(); // Ensures the route is protected

  // State for form and modals
  const [formOpen, setFormOpen] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null); // Stores the ID of the org being updated
  // NEW: State for the ID of the organization to view
  const [selectedOrgIdForView, setSelectedOrgIdForView] = useState<string | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false); // Loader for form submission
  const [deletingOrgId, setDeletingOrgId] = useState<string | null>(null);

  // State for pagination and search
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Standard items per page
  const [searchQuery, setSearchQuery] = useState(''); // New state for search query

  // Authentication token from session storage
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('token') : null;

  const queryClient = useQueryClient(); // React Query client for invalidating/refetching queries

  // Fetch organizations data with React Query
  const { data: orgsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['organizations', currentPage, itemsPerPage, searchQuery],
    queryFn: fetchOrganizations,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  // NEW: Fetch single organization data with React Query
  const {
    data: singleOrgData,
    isLoading: isFetchingSingleOrg,
    isError: isSingleOrgError,
    refetch: refetchSingleOrg,
  } = useQuery({
    queryKey: ['singleOrganization', selectedOrgIdForView],
    queryFn: fetchSingleOrganization,
    enabled: !!selectedOrgIdForView, // Only run this query if selectedOrgIdForView is not null
    refetchOnWindowFocus: false,
    staleTime: 0, // Make this data fresh every time
  });

  // Effect to open the view modal once singleOrgData is fetched
  useEffect(() => {
    if (singleOrgData && selectedOrgIdForView && !isFetchingSingleOrg) {
      setShowViewModal(true);
    }
  }, [singleOrgData, selectedOrgIdForView, isFetchingSingleOrg]);


  // Extract relevant data from the query response for the table and pagination
  const organizations = orgsData?.organizations || [];
  const totalItems = orgsData?.totalItems || 0;
  const totalPages = orgsData?.totalPages || 1; // Default to 1 page if no data

  // Validation schema for the update form
  const validationSchema = useMemo(() => {
    return Yup.object({
      org_name: Yup.string().required('Organization name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
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
      if (!selectedOrgId) return;

      setIsSubmittingForm(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const url = `${baseUrl}/organization/${selectedOrgId}`;
        const method: HttpMethod = 'put';

        await callApi(method, url, values, {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        });

        toast.success('Organization updated successfully!');
        resetForm();
        setFormOpen(false);
        setSelectedOrgId(null);
        queryClient.invalidateQueries({ queryKey: ['organizations'] });
        // Also invalidate the single organization query if it was the one being updated
        queryClient.invalidateQueries({ queryKey: ['singleOrganization', selectedOrgId] });
      } catch (error: any) {
        toast.error(error?.response?.data?.detail || 'Update failed');
      } finally {
        setIsSubmittingForm(false);
      }
    },
  });

  const handleDelete = async (orgId: string) => {
    if (!orgId) return;

    setDeletingOrgId(orgId);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      await callApi('delete', `${baseUrl}/organization/${orgId}`, null, {
        Authorization: `Bearer ${token}`,
      });

      toast.success('Organization deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['organizations'] });

      // If the last item on a page is deleted, go to the previous page
      if (organizations.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }

    } catch (error: any) {
      toast.error(error?.response?.data?.detail || 'Failed to delete organization');
    } finally {
      setDeletingOrgId(null);
    }
  };

  const handleUpdate = (org: OrgData) => {
    setSelectedOrgId(org.id);
    formik.setValues({
      org_name: org.org_name,
      email: org.email,
      password: '',
      address: org.address,
      phone_number: org.phone_number,
      organization_type: org.organization_type,
      description: org.description,
      website: org.website,
      gst_number: org.gst_number,
    });
    setFormOpen(true);
  };

  // UPDATED: handleView now sets the ID for the new query
  const handleView = (org: OrgData) => {
    setSelectedOrgIdForView(org.id); // Set the ID to trigger the single organization fetch
    // The modal will open in a useEffect once singleOrgData is available
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

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

  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-red-500">
        <p>Failed to load organizations. Please try again.</p>
        <Button onClick={() => refetch()} label="Retry" variant="primary" className="mt-4" />
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
        {showViewModal && (isFetchingSingleOrg || singleOrgData) && ( // Show modal if fetching or data exists
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative space-y-3">
              {isFetchingSingleOrg ? (
                <div className="flex justify-center items-center h-48">
                  <Loader />
                </div>
              ) : isSingleOrgError ? (
                <div className="text-red-500 text-center">
                  Failed to load organization details. Please try again.
                  <Button onClick={() => refetchSingleOrg()} label="Retry" variant="primary" className="mt-4" />
                </div>
              ) : singleOrgData ? (
                <>
                  <h3 className="text-xl font-semibold mb-4">🏢 Organization Details</h3>
                  {Object.entries(singleOrgData) // Use singleOrgData here
                    .filter(([key]) => key !== 'id' && key !== 'password' && key !== 'role_type') // Filter out 'id' and 'role_type'
                    .map(([key, value]) => (
                      <div key={key} className="flex text-sm">
                        <span className="font-bold capitalize w-32">{key.replace(/_/g, ' ')}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedOrgIdForView(null); // Clear the ID when closing
                    }}
                    className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
                  >
                    ✖
                  </button>
                </>
              ) : (
                <div className="text-gray-500 text-center">No organization data available.</div>
              )}
            </div>
          </div>
        )}


        {/* Update Form Modal */}
        {formOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
            <div className="bg-white rounded-lg w-full max-w-lg shadow-lg relative">
              {isSubmittingForm && (
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
                          disabled={isSubmittingForm}
                        />
                        {formik.touched[typedField] && formik.errors[typedField] && (
                          <span className="text-sm text-red-500">{formik.errors[typedField]}</span>
                        )}
                      </div>
                    );
                  })}
                  <div className="flex justify-between mt-4">
                    <Button
                      type="button"
                      label="Cancel"
                      onClick={() => {
                        setFormOpen(false);
                        setSelectedOrgId(null);
                        formik.resetForm();
                      }}
                      variant="secondary"
                      disabled={isSubmittingForm}
                    />
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

        <Table
          columns={columns}
          data={organizations}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          actions={(org: OrgData) => (
            <div className="relative">
              <ActionButtons
                onView={() => handleView(org)}
                onUpdate={() => handleUpdate(org)}
                onDelete={() => org?.id && handleDelete(org.id)}
              />
              {deletingOrgId === org.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
                  <Loader />
                </div>
              )}
            </div>
          )}
        />

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