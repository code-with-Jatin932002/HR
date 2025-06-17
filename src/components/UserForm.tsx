
// components/UserForm.tsx
'use client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMemo, useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import callApi from '@/utils/callApi';

interface FormValues {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role_type: string;
  department_name: string;
}

interface UserFormProps {
  isUpdate: boolean;
  initialValues: FormValues;
  onCancel: () => void;
  onSubmit: (values: FormValues) => void;
  currentUserRole: string; // NEW PROP: The role of the currently logged-in user
}

interface Department {
  id: string;
  department_name: string;
}

const validTLDs = ['com', 'org', 'in', 'net', 'edu'];

const emailValidation = Yup.string()
  .required('Email is required')
  .email('Invalid email format')
  .test('no-spaces', 'Email should not contain spaces', (value) => {
    return !/\s/.test(value || '');
  })
  .test('single-at', 'Email must contain only one "@" symbol', (value) => {
    return (value?.match(/@/g) || []).length === 1;
  })
  .test('has-domain', 'Email must contain domain name and TLD', (value) => {
    if (!value) return false;
    const parts = value.split('@');
    if (parts.length !== 2) return false;
    const domainParts = parts[1].split('.');
    return domainParts.length >= 2 && domainParts[0] !== '' && domainParts[1] !== '';
  })
  .test('valid-tld', 'Email must have a valid TLD (.com, .org, .in, .net, .edu)', (value) => {
    if (!value) return false;
    const domainParts = value.split('.');
    const tld = domainParts[domainParts.length - 1];
    return validTLDs.includes(tld.toLowerCase());
  });

export default function UserForm({ isUpdate, initialValues, onCancel, onSubmit, currentUserRole }: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [departmentError, setDepartmentError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        setDepartmentError(null);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await callApi('get', `${baseUrl}/department`, null, {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        });
        setDepartments(response);
      } catch (err: any) {
        console.error("Failed to fetch departments:", err);
        setDepartmentError(err?.response?.data?.detail || 'Failed to load departments. Please try again.');
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  const validationSchema = useMemo(() => {
    return Yup.object({
      first_name: isUpdate && !initialValues.first_name
        ? Yup.string()
        : Yup.string().required('First name is required'),
      last_name: isUpdate && !initialValues.last_name
        ? Yup.string()
        : Yup.string().required('Last name is required'),
      email: isUpdate ? Yup.string().email('Invalid email').required('Email is required') : emailValidation,
      password: isUpdate
        ? Yup.string()
        : Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
      // role_type: Yup.string().required('Role type is required'),
       role_type: isUpdate && !initialValues.role_type
         ? Yup.string()
         : Yup.string().required('Role type is required'),
      department_name: isUpdate && !initialValues.department_name
        ? Yup.string()
        : Yup.string().required('Department name is required'),
    });
  }, [isUpdate, initialValues]);

  // Determine allowed roles based on currentUserRole
  const allowedRoles = useMemo(() => {
    switch (currentUserRole?.toLowerCase()) {
      case 'super_admin': // Assuming 'super_admin' is the role type
        return ['Admin', 'HR', 'Employee'];
      case 'admin':
        return ['HR', 'Employee'];
      case 'hr':
        return ['Employee'];
      default:
        return [];
    }
  }, [currentUserRole]);

  // Determine the effective initial role type for the form
  const effectiveInitialRoleType = useMemo(() => {
    // If not in update mode and allowedRoles exist
    if (!isUpdate && allowedRoles.length > 0) {
      // If the passed initialValues.role_type is NOT in allowedRoles,
      // or if initialValues.role_type is empty/null, default to the first allowed role
      if (!initialValues.role_type || !allowedRoles.includes(initialValues.role_type)) {
        return allowedRoles[0];
      }
    }
    // Otherwise, use the role_type from initialValues
    return initialValues.role_type;
  }, [isUpdate, allowedRoles, initialValues.role_type]);


  const formik = useFormik<FormValues>({
    initialValues: {
        ...initialValues,
        role_type: effectiveInitialRoleType, // Use the dynamically determined initial role type
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit,
  });


  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">First Name</label>
          <input
            type="text"
            name="first_name"
            value={formik.values.first_name || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border rounded py-3 px-4 text-black outline-none focus:border-blue-500"
            placeholder="Enter First Name"
          />
          {formik.touched.first_name && formik.errors.first_name && (
            <span className="text-sm text-red-500">{formik.errors.first_name}</span>
          )}
        </div>

        <div>
          <label className="block mb-1">Last Name</label>
          <input
            type="text"
            name="last_name"
            value={formik.values.last_name || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border rounded py-3 px-4 text-black outline-none focus:border-blue-500"
            placeholder="Enter Last Name"
          />
          {formik.touched.last_name && formik.errors.last_name && (
            <span className="text-sm text-red-500">{formik.errors.last_name}</span>
          )}
        </div>

        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border rounded py-3 px-4 text-black outline-none focus:border-blue-500"
            placeholder="Enter Email"
          />
          {formik.touched.email && formik.errors.email && (
            <span className="text-sm text-red-500">{formik.errors.email}</span>
          )}
        </div>

        {!isUpdate && (
          <div className="relative">
            <label className="block mb-1">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border rounded py-3 px-4 text-black outline-none focus:border-blue-500"
              placeholder="Enter password"
            />
            <div
              className="absolute top-11 right-3 cursor-pointer text-gray-600"
              onClick={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
            {formik.touched.password && formik.errors.password && (
              <span className="text-sm text-red-500">{formik.errors.password}</span>
            )}
          </div>
        )}

        <div className="col-span-2">
          <label className="block mb-1">Role Type</label>
          <select
            name="role_type"
            value={formik.values.role_type}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border rounded py-3 px-4 text-black outline-none focus:border-blue-500"
          >
            {allowedRoles.length === 0 && <option value="">No roles available</option>}
            {allowedRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          {formik.touched.role_type && formik.errors.role_type && (
            <span className="text-sm text-red-500">{formik.errors.role_type}</span>
          )}
        </div>

        <div className="col-span-2">
          <label className="block mb-1">Department Name</label>
          {loadingDepartments ? (
            <p>Loading departments...</p>
          ) : departmentError ? (
            <span className="text-sm text-red-500">{departmentError}</span>
          ) : (
            <select
              name="department_name"
              value={formik.values.department_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border rounded-lg py-3 px-4 text-black outline-none focus:border-blue-500"
            >
              <option value="">Select a Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.department_name}>
                  {dept.department_name}
                </option>
              ))}
            </select>
          )}
          {formik.touched.department_name && formik.errors.department_name && (
            <span className="text-sm text-red-500">{formik.errors.department_name}</span>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
        >
          {isUpdate ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  );
}