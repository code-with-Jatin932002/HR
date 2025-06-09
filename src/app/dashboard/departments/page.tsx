
'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import callApi from '@/utils/callApi';
import useAuthRedirect from '@/hooks/useAuthRedirect';
import useProtectRoute from '@/hooks/useProtectRoute';
import Table from '@/components/Table';
import ActionButtons from '@/components/ActionButtons';

const MySwal = withReactContent(Swal);

const columns = [
  { label: 'Department Name', key: 'department_name' },
];

const fetchDepartments = async () => {
  const token = localStorage.getItem('token');
  // return await callApi('get', 'http://127.0.0.1:5000/department', null, {
   const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  return await callApi('get', `${baseUrl}/department`, null, {
    Authorization: `Bearer ${token}`,
  });
};

export default function DepartmentsPage() {
  useAuthRedirect();
  useProtectRoute();

  const queryClient = useQueryClient();

  const { data: departments = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['departments'],
    queryFn: fetchDepartments,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState('');

  const validationSchema = useMemo(() => {
    return Yup.object({
      department_name: Yup.string().required('Department name is required'),
    });
  }, [isUpdate]);

  const formik = useFormik({
    initialValues: {
      department_name: '',
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {

      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      const url = isUpdate
        ? `${baseUrl}/department/${selectedDeptId}`
        // : '${baseUrl}/department';
          : `${baseUrl}/department`;
      const method = isUpdate ? 'put' : 'post';

      try {
        await callApi(method, url, values, {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        });

        await MySwal.fire({
          icon: 'success',
          title: `Department ${isUpdate ? 'updated' : 'created'} successfully!`,
          timer: 1500,
          showConfirmButton: false,
        });

        refetch();
        setFormOpen(false);
        setIsUpdate(false);
        setSelectedDeptId('');
        resetForm();
      } catch (error: any) {
        MySwal.fire('Error', error?.response?.data?.detail || 'Something went wrong', 'error');
      }
    },
  });

  const handleUpdate = (dept: any) => {
    setSelectedDeptId(dept.id);
    setIsUpdate(true);
    formik.setValues({
      department_name: dept.department_name,
    });
    setFormOpen(true);
  };

  const handleDelete = async (deptId: string) => {
    const confirm = await MySwal.fire({
      title: 'Are you sure?',
      text: 'This will delete the department!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (confirm.isConfirmed) {
      try {
        // await callApi('delete', `http://127.0.0.1:5000/department/${deptId}`, null, {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        await callApi('delete', `${baseUrl}/department/${deptId}`, null, {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        });

        MySwal.fire('Deleted!', 'Department has been deleted.', 'success');
        refetch();
      } catch (error: any) {
        MySwal.fire('Error', error?.response?.data?.detail || 'Failed to delete department', 'error');
      }
    }
  };

  if (isLoading) return <p>Loading departments...</p>;
  if (isError) return <p>Failed to load departments.</p>;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded shadow">
        {/* Top Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Department Management</h2>
          <button
            onClick={() => {
              setFormOpen(true);
              setIsUpdate(false);
              setSelectedDeptId('');
              formik.resetForm();
            }}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create Department
          </button>
        </div>

        {/* Form Modal */}
        {formOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
              <h3 className="text-xl font-semibold mb-4">{isUpdate ? 'Update Department' : 'Create Department'}</h3>
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1">Department Name</label>
                  <input
                    type="text"
                    name="department_name"
                    value={formik.values.department_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full border px-3 py-2 rounded"
                  />
                  {formik.touched.department_name && formik.errors.department_name && (
                    <span className="text-sm text-red-500">{formik.errors.department_name}</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <button type="button" onClick={() => setFormOpen(false)} className="bg-gray-300 px-4 py-2 rounded">
                    Cancel
                  </button>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    {isUpdate ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table */}
        <div>
          <h3 className="text-xl font-semibold mb-4">All Departments</h3>
          <Table
            columns={columns}
            data={departments}
            actions={(dept) => (
              <ActionButtons
                onUpdate={() => handleUpdate(dept)}
                onDelete={() => handleDelete(dept.id)}
                  showView={false} // 🔥 This hides the "View" button for Departments

              />
            )}
              itemsPerPage={10}

          />
        </div>
      </div>
    </div>
  );
}
