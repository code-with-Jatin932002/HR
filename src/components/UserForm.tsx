// userform.tsx
'use client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMemo, useState, useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import callApi from '@/utils/callApi';
import Button from './Button';

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
  currentUserRole: string;
  isSubmitting?: boolean; // Keep this prop to disable individual fields
}

interface Department {
  id: string;
  department_name: string;
}

interface Role {
  id: string;
  role_type: string;
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

export default function UserForm({ isUpdate, initialValues, onCancel, onSubmit, currentUserRole, isSubmitting = false }: UserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [departmentError, setDepartmentError] = useState<string | null>(null);

  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [rolesError, setRolesError] = useState<string | null>(null);

  const [selectedRole, setSelectedRole] = useState(initialValues.role_type || '');

  useEffect(() => {
    setSelectedRole(initialValues.role_type || '');
  }, [initialValues.role_type]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        setDepartmentError(null);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await callApi('get', `${baseUrl}/department`, null, {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        });
        setDepartments(response.departments || []);
      } catch (err: any) {
        console.error('Failed to fetch departments:', err);
        setDepartmentError(err?.response?.data?.detail || 'Failed to load departments. Please try again.');
      } finally {
        setLoadingDepartments(false);
      }
    };

    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);
        setRolesError(null);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await callApi('get', `${baseUrl}/roles`, null, {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        });
        setAvailableRoles(response || []);
      } catch (err: any) {
        console.error('Failed to fetch roles:', err);
        setRolesError(err?.response?.data?.detail || 'Failed to load roles. Please try again.');
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchDepartments();
    fetchRoles();
  }, []);

  const validationSchema = useMemo(() => {
    return Yup.object({
      first_name: Yup.string().required('First name is required'),
      last_name: Yup.string().required('Last name is required'),
      email: isUpdate ? Yup.string().email('Invalid email').required('Email is required') : emailValidation,
      password: isUpdate
        ? Yup.string()
        : Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
      role_type: Yup.string().required('Role type is required'),
      department_name: Yup.string().when('role_type', {
        is: (roleType: string | undefined) =>
          (roleType ?? '').toLowerCase() !== 'admin' && (roleType ?? '').toLowerCase() !== 'super_admin',
        then: (schema) => schema.required('Department name is required'),
        otherwise: (schema) => schema.notRequired().nullable(),
      }),
    });
  }, [isUpdate]);

  const filteredRoles = useMemo(() => {
    let allowedRoles: Role[] = [];

    switch (currentUserRole?.toLowerCase()) {
      case 'super_admin':
        allowedRoles = availableRoles.filter((role) => ['admin'].includes(role.role_type.toLowerCase()));
        break;
      case 'admin':
        allowedRoles = availableRoles.filter((role) =>
          ['manager', 'hr', 'employee'].includes(role.role_type.toLowerCase()),
        );
        break;
      case 'manager':
        allowedRoles = availableRoles.filter((role) => ['hr', 'employee'].includes(role.role_type.toLowerCase()));
        break;
      case 'hr':
        allowedRoles = availableRoles.filter((role) => ['employee'].includes(role.role_type.toLowerCase()));
        break;
      default:
        allowedRoles = [];
    }

    if (isUpdate && initialValues.role_type) {
      const currentRoleObj = availableRoles.find((role) => role.role_type === initialValues.role_type);
      if (currentRoleObj && !allowedRoles.some((role) => role.role_type === currentRoleObj.role_type)) {
        allowedRoles.push(currentRoleObj);
      }
    }

    return allowedRoles;
  }, [currentUserRole, availableRoles, isUpdate, initialValues.role_type]);

  const formik = useFormik<FormValues>({
    initialValues: {
      ...initialValues,
      role_type: initialValues.role_type || '',
      department_name:
        ((initialValues.role_type || '').toLowerCase() === 'admin' ||
          (initialValues.role_type || '').toLowerCase() === 'super_admin')
          ? ''
          : initialValues.department_name || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, formikHelpers) => {
      const submittedValues = { ...values };
      if ((submittedValues.role_type || '').toLowerCase() === 'admin' || (submittedValues.role_type || '').toLowerCase() === 'super_admin') {
        submittedValues.department_name = '';
      }
      onSubmit(submittedValues);
      formikHelpers.setSubmitting(false);
    },
  });

  const handleRoleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    formik.handleChange(e);
    const newRole = e.target.value;
    setSelectedRole(newRole);
    if (newRole.toLowerCase() === 'admin' || newRole.toLowerCase() === 'super_admin') {
      formik.setFieldValue('department_name', '');
      formik.setFieldTouched('department_name', false);
    }
  };

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block">First Name</label>
          <input
            type="text"
            name="first_name"
            value={formik.values.first_name || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full rounded border px-4 py-3 text-black outline-none focus:border-blue-500"
            placeholder="Enter First Name"
            disabled={isSubmitting} // Disable when submitting
          />
          {formik.touched.first_name && formik.errors.first_name && (
            <span className="text-sm text-red-500">{formik.errors.first_name}</span>
          )}
        </div>

        <div>
          <label className="mb-1 block">Last Name</label>
          <input
            type="text"
            name="last_name"
            value={formik.values.last_name || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full rounded border px-4 py-3 text-black outline-none focus:border-blue-500"
            placeholder="Enter Last Name"
            disabled={isSubmitting} // Disable when submitting
          />
          {formik.touched.last_name && formik.errors.last_name && (
            <span className="text-sm text-red-500">{formik.errors.last_name}</span>
          )}
        </div>

        <div>
          <label className="mb-1 block">Email</label>
          <input
            type="email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full rounded border px-4 py-3 text-black outline-none focus:border-blue-500"
            placeholder="Enter Email"
            disabled={isSubmitting} // Disable when submitting
          />
          {formik.touched.email && formik.errors.email && (
            <span className="text-sm text-red-500">{formik.errors.email}</span>
          )}
        </div>

        {!isUpdate && (
          <div className="relative">
            <label className="mb-1 block">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full rounded border px-4 py-3 text-black outline-none focus:border-blue-500"
              placeholder="Enter password"
              disabled={isSubmitting} // Disable when submitting
            />
            <div
              className="absolute right-3 top-11 cursor-pointer text-gray-600"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
            {formik.touched.password && formik.errors.password && (
              <span className="text-sm text-red-500">{formik.errors.password}</span>
            )}
          </div>
        )}

        <div className="col-span-2">
          <label className="mb-1 block">Role Type</label>
          {loadingRoles ? (
            <p>Loading roles...</p>
          ) : rolesError ? (
            <span className="text-sm text-red-500">{rolesError}</span>
          ) : (
            <select
              name="role_type"
              value={formik.values.role_type}
              onChange={handleRoleTypeChange}
              onBlur={formik.handleBlur}
              className="w-full rounded border px-4 py-3 text-black outline-none focus:border-blue-500"
              disabled={isSubmitting} // Disable when submitting
            >
              {(!isUpdate || !formik.values.role_type) && <option value="" disabled>Select a Role</option>}
              {filteredRoles.map((role) => (
                <option key={role.id} value={role.role_type}>
                  {role.role_type}
                </option>
              ))}
            </select>
          )}
          {formik.touched.role_type && formik.errors.role_type && (
            <span className="text-sm text-red-500">{formik.errors.role_type}</span>
          )}
        </div>

        {(selectedRole.toLowerCase() !== 'admin' && selectedRole.toLowerCase() !== 'super_admin') && (
          <div className="col-span-2">
            <label className="mb-1 block">Department Name</label>
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
                className="w-full rounded border px-4 py-3 text-black outline-none focus:border-blue-500"
                disabled={isSubmitting} // Disable when submitting
              >
                <option value="" disabled>Select a Department</option>
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
        )}
      </div>

      <div className="flex justify-between">
        <Button label="Cancel" type="button" onClick={onCancel} variant="secondary" disabled={isSubmitting} />
        <Button type="submit" label={isUpdate ? 'Update User' : 'Create User'} variant="primary" disabled={isSubmitting} />
      </div>
    </form>
  );
}