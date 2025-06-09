
'use client';

import { useQuery } from '@tanstack/react-query';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import callApi from '@/utils/callApi';
import ActionButtons from '@/components/ActionButtons';
import Table from '@/components/Table';

const MySwal = withReactContent(Swal);

interface OrgData {
  id: string;
  org_name: string;
  password: string;
  address: string;
  phone_number: string;
  industry: string;
  description: string;
  website: string;
  gst_number: string;
}

const fields: (keyof Omit<OrgData, 'id'>)[] = [
  'org_name',
  'password',
  'address',
  'phone_number',
  'industry',
  'description',
  'website',
  'gst_number',
];

const columns = [
  { label: 'Name', key: 'org_name' },
  { label: 'Industry', key: 'industry' },
  { label: 'Phone', key: 'phone_number' },
  { label: 'Website', key: 'website' },
];

const fetchOrganizations = async () => {
  const token = localStorage.getItem('token');
  // return await callApi('get', 'http://127.0.0.1:5000/organization', null, {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  return await callApi('get', `${baseUrl}/organization`, null, {
    Authorization: `Bearer ${token}`,
  });
};

export default function OrganizationPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [viewOrg, setViewOrg] = useState<OrgData | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState('');

  const { data: orgs = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['organizations'],
    queryFn: fetchOrganizations,
  });

  const validationSchema = useMemo(() => {
    return Yup.object({
      org_name: Yup.string().required('Organization name is required'),
      password: Yup.string().min(6).required('Password is required'),
      address: Yup.string().required('Address is required'),
      phone_number: Yup.string().required('Phone number is required'),
      industry: Yup.string().required('Industry is required'),
      description: Yup.string().required('Description is required'),
      website: Yup.string().url().required('Website is required'),
      gst_number: Yup.string().required('GST Number is required'),
    });
  }, []);

  const formik = useFormik<Omit<OrgData, 'id'>>({
    initialValues: {
      org_name: '',
      password: '',
      address: '',
      phone_number: '',
      industry: '',
      description: '',
      website: '',
      gst_number: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!selectedOrgId) return;

      try {
        // const url = `http://127.0.0.1:5000/organization/${selectedOrgId}`;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const url = `${baseUrl}/organization/${selectedOrgId}`;

        await callApi('put', url, values, {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        });

        await MySwal.fire({
          icon: 'success',
          title: 'Organization updated successfully!',
          timer: 1500,
          showConfirmButton: false,
        });

        resetForm();
        setFormOpen(false);
        refetch();
      } catch (error: any) {
        MySwal.fire('Error', error?.response?.data?.detail || 'Update failed', 'error');
      }
    },
  });

  const handleDelete = async (orgId: string) => {
    if (!orgId) return;

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
      try {
        // await callApi('delete', `http://127.0.0.1:5000/organization/${orgId}`, null, {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        await callApi('delete', `${baseUrl}/organization/${orgId}`, null, {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        });

        MySwal.fire('Deleted!', 'Organization deleted.', 'success');
        refetch();
      } catch (error: any) {
        MySwal.fire('Error', error?.response?.data?.detail || 'Delete failed', 'error');
      }
    }
  };

  const handleUpdate = (org: OrgData) => {
    setSelectedOrgId(org.id);
    formik.setValues({
      org_name: org.org_name,
      password: org.password,
      address: org.address,
      phone_number: org.phone_number,
      industry: org.industry,
      description: org.description,
      website: org.website,
      gst_number: org.gst_number,
    });
    setFormOpen(true);
  };

  const handleView = (org: OrgData) => {
    setViewOrg(org);
    setShowViewModal(true);
  };

  if (isLoading) return <p>Loading organizations...</p>;
  if (isError) return <p>Failed to load organizations.</p>;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto mt-10 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-6">Organizations</h2>

        {/* View Modal */}
        {showViewModal && viewOrg && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative space-y-3">
              <h3 className="text-xl font-semibold mb-4">🏢 Organization Details</h3>
              {Object.entries(viewOrg).map(([key, value]) => (
                <div key={key} className="flex text-sm">
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

        {/* Form Modal */}
        {formOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
            <div className="bg-white rounded-lg w-full max-w-lg shadow-lg relative">
              <div className="p-6 max-h-[80vh] overflow-y-auto">
                <h3 className="text-xl font-semibold mb-4">Update Organization</h3>
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                  {fields.map((field) => {
                    const typedField = field as keyof typeof formik.values;
                    return (
                      <div key={field}>
                        <label className="block mb-1 capitalize">{field.replace(/_/g, ' ')}</label>
                        <input
                          type="text"
                          name={field}
                          value={formik.values[typedField] || ''}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          className="w-full border rounded py-2 px-3 text-black outline-none focus:border-blue-500"
                        />
                        {formik.touched[typedField] && formik.errors[typedField] && (
                          <span className="text-sm text-red-500">{formik.errors[typedField]}</span>
                        )}
                      </div>
                    );
                  })}
                  <div className="flex justify-between mt-4">
                    <button
                      type="button"
                      onClick={() => setFormOpen(false)}
                      className="bg-gray-300 px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Update Organization
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <Table
          columns={columns}
          data={orgs}
          actions={(org: OrgData) => (
            <ActionButtons
              onView={() => handleView(org)}
              onUpdate={() => handleUpdate(org)}
              onDelete={() => org?.id && handleDelete(org.id)}
            />
          )}
          itemsPerPage={10}
        />
      </div>
    </div>
  );
}
