'use client';
import { useQuery, useQueryClient, QueryFunction } from '@tanstack/react-query';
import { useState, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast'; // Import react-hot-toast
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FiSearch, FiX } from 'react-icons/fi';

import callApi from '@/utils/callApi';
import useAuthRedirect from '@/hooks/useAuthRedirect';
import useProtectRoute from '@/hooks/useProtectRoute';
import Table from '@/components/Table';
import ActionButtons from '@/components/ActionButtons';
import Loader from '@/components/Loader'; // Ensure this is the correct path to your Loader
import Button from '@/components/Button';
import Pagination from '@/components/Pagination';

interface OrganizationType {
  id: string;
  org_type: string;
}

interface ApiResponse {
  organization_types: OrganizationType[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

interface ApiResponseError {
  response?: {
    data?: {
      detail?: string;
    };
  };
}

const columns = [
  { label: 'Organization Type Name', key: 'org_type' },
];

type HttpMethod = 'get' | 'post' | 'put' | 'delete';

const fetchOrganizationTypes: QueryFunction<
  ApiResponse,
  ['organizationTypes', number, number, string]
> = async ({ queryKey }) => {
  const [_key, currentPage, itemsPerPage, searchQuery] = queryKey;
  const token = sessionStorage.getItem('token');

  if (!token) {
    throw new Error('Authentication token not found.');
  }

  // Corrected the process.env variable name. Assuming NEXT_PUBLIC_API_URL based on department.tsx
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;

  let url = `${normalizedBaseUrl}organization-types?page=${currentPage}&limit=${itemsPerPage}`;

  if (searchQuery) {
    url += `&search=${encodeURIComponent(searchQuery)}`;
  }

  try {
    const response = await callApi('get', url, null, {
      Authorization: `Bearer ${token}`,
    });
    return response as ApiResponse;
  } catch (error) {
    console.error('Error fetching organization types:', error);
    throw error;
  }
};

export default function OrganizationTypePage() {
  useAuthRedirect();
  useProtectRoute();

  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedOrgTypeId, setSelectedOrgTypeId] = useState<string>('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewOrg, setViewOrg] = useState<OrganizationType | null>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [deletingOrgTypeId, setDeletingOrgTypeId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: orgTypeData,
    isLoading,
    isError,
    refetch,
  } = useQuery<ApiResponse, Error, ApiResponse, ['organizationTypes', number, number, string]>({
    queryKey: ['organizationTypes', currentPage, itemsPerPage, searchQuery],
    queryFn: fetchOrganizationTypes,
    placeholderData: (previousData) => previousData,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const organizationTypes = orgTypeData?.organization_types ?? [];
  const totalItems = orgTypeData?.totalItems || 0;
  const totalPages = orgTypeData?.totalPages || 1;

  const validationSchema = useMemo(() => {
    return Yup.object({
      org_type: Yup.string().required('Organization type name is required'),
    });
  }, []);

  const formik = useFormik({
    initialValues: {
      org_type: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsSubmittingForm(true);
      // Corrected the process.env variable name. Assuming NEXT_PUBLIC_API_URL based on department.tsx
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
      const url = isUpdate
        ? `${normalizedBaseUrl}organization-types/${selectedOrgTypeId}`
        : `${normalizedBaseUrl}organization-types/`;
      const method: HttpMethod = isUpdate ? 'put' : 'post';

      try {
        await callApi(method, url, values, {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        });

        toast.success(`Organization type ${isUpdate ? 'updated' : 'created'} successfully!`);

        queryClient.invalidateQueries({ queryKey: ['organizationTypes'] });
        setCurrentPage(1);

        setFormOpen(false);
        setIsUpdate(false);
        setSelectedOrgTypeId('');
        resetForm();
      } catch (error: unknown) {
        const apiError = error as ApiResponseError;
        toast.error(apiError?.response?.data?.detail || 'Something went wrong');
      } finally {
        setIsSubmittingForm(false);
      }
    },
  });

  const handleUpdate = (orgType: OrganizationType) => {
    setSelectedOrgTypeId(orgType.id);
    setIsUpdate(true);
    formik.setValues({ org_type: orgType.org_type });
    setFormOpen(true);
  };

  const handleDelete = async (orgTypeId: string) => {
    setDeletingOrgTypeId(orgTypeId);
    try {
      // Corrected the process.env variable name. Assuming NEXT_PUBLIC_API_URL based on department.tsx
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const normalizedBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
      await callApi('delete', `${normalizedBaseUrl}organization-types/${orgTypeId}`, null, {
        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
      });

      toast.success('Organization type has been deleted.');
      queryClient.invalidateQueries({ queryKey: ['organizationTypes'] });

      if (organizationTypes.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    } catch (error: unknown) {
      const apiError = error as ApiResponseError;
      toast.error(apiError?.response?.data?.detail || 'Failed to delete organization type');
    } finally {
      setDeletingOrgTypeId(null);
    }
  };

  const handleView = (orgType: OrganizationType) => {
    setViewOrg(orgType);
    setShowViewModal(true);
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
  };

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
        <p>Failed to load organization types. Please try again.</p>
        <Button onClick={() => refetch()} label="Retry" variant="primary" className="mt-4" />
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-center sm:text-left">Organization Types</h2>
          <Button
            label="Create Organization Type"
            onClick={() => {
              setFormOpen(true);
              setIsUpdate(false);
              setSelectedOrgTypeId('');
              formik.resetForm();
            }}
            variant="primary"
            disabled={isSubmittingForm}
            className="w-full sm:w-auto px-4 py-2" // Added responsive classes
          />
        </div>

        {/* Search Box for Organization Types */}
        <div className="w-full px-4 py-3">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <FiSearch />
            </span>
            <input
              type="text"
              placeholder="Search by organization type name..."
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

        {/* Form Modal */}
        {formOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
              {isSubmittingForm && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80">
                  <Loader />
                </div>
              )}
              <h3 className="text-xl font-semibold mb-4">
                {isUpdate ? 'Update Organization Type' : 'Create Organization Type'}
              </h3>
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="org_type" className="block text-sm font-medium mb-1">Organization Type Name</label>
                  <input
                    id="org_type"
                    name="org_type"
                    type="text"
                    value={formik.values.org_type}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full border rounded px-3 py-2"
                    disabled={isSubmittingForm}
                  />
                  {formik.touched.org_type && formik.errors.org_type && (
                    <p className="text-sm text-red-500 mt-1">{formik.errors.org_type}</p>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    label="Cancel"
                    onClick={() => {
                      setFormOpen(false);
                      formik.resetForm();
                    }}
                    variant="secondary"
                    disabled={isSubmittingForm}
                  />
                  <Button
                    type="submit"
                    label={isUpdate ? 'Update' : 'Create'}
                    variant="primary"
                    disabled={isSubmittingForm}
                  />
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && viewOrg && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl relative">
              <h3 className="text-xl font-semibold mb-4">🏢 Organization Type Details</h3>
              {Object.entries(viewOrg).filter(([key]) => key !== 'id').map(([key, value]) => (
                <div key={key} className="flex text-sm mb-1">
                  <span className="font-semibold w-36 capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span>{String(value)}</span>
                </div>
              ))}
              <button
                onClick={() => setShowViewModal(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl p-2"
              >
                ✖
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div>
          {/* <h3 className="text-xl font-semibold mb-4 text-gray-800">All Organization Types</h3> */}
          <Table
            columns={columns}
            data={organizationTypes}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            actions={(orgType: OrganizationType) => (
              <div className="relative flex items-center justify-center h-full">
                {deletingOrgTypeId === orgType.id ? (
                  // Apply smaller size directly to the Loader's container
                  // Or, if Loader component itself has internal styling for small,
                  // you would modify Loader.tsx to accept a 'small' prop.
                  <div className="flex items-center justify-center w-6 h-6"> {/* Adjusted to w-6 h-6 for even smaller loader */}
                    <Loader /> {/* Removed size="small" */}
                  </div>
                ) : (
                  <ActionButtons
                    onView={() => handleView(orgType)}
                    onUpdate={() => handleUpdate(orgType)}
                    onDelete={() => handleDelete(orgType.id)}
                    showView
                  />
                )}
              </div>
            )}
          />
        </div>

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