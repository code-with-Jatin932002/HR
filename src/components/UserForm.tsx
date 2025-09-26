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
  date_of_birth: string;
  mobile_number: string;
  gender: string;
  marital_status: string;
  employee_type: string;
  joining_date: string;
  working_days: string;
  official_email: string;
  slack_id: string;
  github_id: string;
  address: string;
  image_url: string;
}

interface UserFormProps {
  isUpdate: boolean;
  initialValues: FormValues;
  onCancel: () => void;
  onSubmit: (values: FormValues) => void;
  currentUserRole: string;
  isSubmitting?: boolean;
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
      date_of_birth: Yup.string().required('Date of Birth is required'),
      mobile_number: Yup.string()
        .required('Mobile number is required')
        .matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits and contain only numbers'),
      gender: Yup.string().required('Gender is required'),
      marital_status: Yup.string().required('Marital status is required'),
      employee_type: Yup.string().required('Employee type is required'),
      joining_date: Yup.string().required('Joining date is required'),
      // working_days: Yup.string().required('Working days is required'),
      working_days: Yup.string()
        .required('Weekly working days is required')
        .matches(/^[1-6]$/, 'Weekly working days must be 6 days or less'),
      official_email: emailValidation.required('Official email is required'),
      slack_id: Yup.string()
        .required('Slack ID is required')
        .matches(/^[UT][A-Z0-9]{8,11}$/, 'Invalid Slack ID start with U or T, 8-11 uppercase letters or numbers.'),
      github_id: Yup.string()
        .required('GitHub ID is required')
        .max(20, 'GitHub ID can have a max of 20 characters')
        .matches(/^(?![_-])(?!.*__)(?!.*--)(?!.*[_-]$)(?!.*[_-][_-])(?!.*[_-][A-Z])(?!.*[_-][0-9])(?!.*[A-Z][_-])(?!.*[0-9][_-])[a-zA-Z0-9-]{1,20}$/, 'Invalid GitHub ID only contain alphanumeric characters and single hyphens, but not at the start or end.'),
     address: Yup.string()
  .required('Address is required')
  .max(25, 'Address can have a maximum of 25 characters'),
      image_url: Yup.string().url('Must be a valid URL'),
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
      date_of_birth: initialValues.date_of_birth || '',
      mobile_number: initialValues.mobile_number || '',
      gender: initialValues.gender || '',
      marital_status: initialValues.marital_status || '',
      employee_type: initialValues.employee_type || '',
      joining_date: initialValues.joining_date || '',
      working_days: initialValues.working_days || '',
      official_email: initialValues.official_email || '',
      slack_id: initialValues.slack_id || '',
      github_id: initialValues.github_id || '',
      address: initialValues.address || '',
      image_url: initialValues.image_url || '',
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
      {/* Scrollable Container for the form fields */}
      <div className="max-h-[60vh]  w-full  overflow-y-auto pr-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* First Name */}
          <div>
            <label className="mb-1 text-gray-700 block">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formik.values.first_name || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
              placeholder="Enter First Name"
              disabled={isSubmitting}
            />
            {formik.touched.first_name && formik.errors.first_name && (
              <span className="text-sm text-red-500">{formik.errors.first_name}</span>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="mb-1 text-gray-700 block">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formik.values.last_name || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
              placeholder="Enter Last Name"
              disabled={isSubmitting}
            />
            {formik.touched.last_name && formik.errors.last_name && (
              <span className="text-sm text-red-500">{formik.errors.last_name}</span>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 text-gray-700 block">Email</label>
            <input
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
              placeholder="Enter Email"
              disabled={isSubmitting}
            />
            {formik.touched.email && formik.errors.email && (
              <span className="text-sm text-red-500">{formik.errors.email}</span>
            )}
          </div>

          {/* Password */}
          {!isUpdate && (
            <div className="relative">
              <label className="mb-1 text-gray-700 block">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
                placeholder="Enter password"
                disabled={isSubmitting}
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

          {/* Date of Birth */}
          <div>
            <label className="mb-1 text-gray-700 block">Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={formik.values.date_of_birth}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
              disabled={isSubmitting}
            />
            {formik.touched.date_of_birth && formik.errors.date_of_birth && (
              <span className="text-sm text-red-500">{formik.errors.date_of_birth}</span>
            )}
          </div>

          {/* Joining Date */}
          <div>
            <label className="mb-1 text-gray-700 block">Joining Date</label>
            <input
              type="date"
              name="joining_date"
              value={formik.values.joining_date}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
              disabled={isSubmitting}
            />
            {formik.touched.joining_date && formik.errors.joining_date && (
              <span className="text-sm text-red-500">{formik.errors.joining_date}</span>
            )}
          </div>

          {/* Mobile Number */}
          <div>
            <label className="mb-1 text-gray-700 block">Mobile Number</label>
            <input
              type="text"
              name="mobile_number"
              value={formik.values.mobile_number}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              disabled={isSubmitting}
            />
            {formik.touched.mobile_number && formik.errors.mobile_number && (
              <span className="text-sm text-red-500">{formik.errors.mobile_number}</span>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="mb-1 text-gray-700 block">Gender</label>
            <select
              name="gender"
              value={formik.values.gender}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
              disabled={isSubmitting}
            >
              <option value="" disabled>Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Others">Others</option>
            </select>
            {formik.touched.gender && formik.errors.gender && (
              <span className="text-sm text-red-500">{formik.errors.gender}</span>
            )}
          </div>

          {/* Marital Status */}
          <div>
            <label className="mb-1 text-gray-700 block">Marital Status</label>
            <select
              name="marital_status"
              value={formik.values.marital_status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
              disabled={isSubmitting}
            >
              <option value="" disabled>Select Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
            </select>
            {formik.touched.marital_status && formik.errors.marital_status && (
              <span className="text-sm text-red-500">{formik.errors.marital_status}</span>
            )}
          </div>

          {/* Employee Type */}
          <div>
            <label className="mb-1 text-gray-700 block">Employee Type</label>
            <select
              name="employee_type"
              value={formik.values.employee_type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
              disabled={isSubmitting}
            >
              <option value="" disabled>Select Type</option>
              <option value="Permanent">Permanent</option>
              <option value="Intern">Intern</option>
            </select>
            {formik.touched.employee_type && formik.errors.employee_type && (
              <span className="text-sm text-red-500">{formik.errors.employee_type}</span>
            )}
          </div>

          {/* Working Days */}
          <div>
            <label className="mb-1 block text-gray-700">Week Working Days</label>
            <input
              type="text"
              name="working_days"
              value={formik.values.working_days}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
              placeholder="e.g., Mon-Fri, 5"
              disabled={isSubmitting}
            />
            {formik.touched.working_days && formik.errors.working_days && (
              <span className="text-sm text-red-500">{formik.errors.working_days}</span>
            )}
          </div>
          
          {/* Official Email */}
          <div>
            <label className="mb-1 text-gray-700 block">Official Email</label>
            <input
              type="email"
              name="official_email"
              value={formik.values.official_email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
              placeholder="Enter Official Email"
              disabled={isSubmitting}
            />
            {formik.touched.official_email && formik.errors.official_email && (
              <span className="text-sm text-red-500">{formik.errors.official_email}</span>
            )}
          </div>

          {/* Slack ID */}
          <div>
            <label className="mb-1 text-gray-700 block">Slack ID</label>
            <input
              type="text"
              name="slack_id"
              value={formik.values.slack_id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
              placeholder="Enter Slack ID"
              disabled={isSubmitting}
            />
            {formik.touched.slack_id && formik.errors.slack_id && (
              <span className="text-sm text-red-500">{formik.errors.slack_id}</span>
            )}
          </div>

          {/* GitHub ID */}
          <div>
            <label className="mb-1 text-gray-700 block">GitHub ID</label>
            <input
              type="text"
              name="github_id"
              value={formik.values.github_id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
              placeholder="Enter GitHub ID"
              disabled={isSubmitting}
            />
            {formik.touched.github_id && formik.errors.github_id && (
              <span className="text-sm text-red-500">{formik.errors.github_id}</span>
            )}
          </div>
          
          {/* Address */}
          <div>
            <label className="mb-1 text-gray-700 block">Address</label>
            <input
              type="text"
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
              placeholder="Enter Address"
              disabled={isSubmitting}
            />
            {formik.touched.address && formik.errors.address && (
              <span className="text-sm text-red-500">{formik.errors.address}</span>
            )}
          </div>

          {/* Image URL */}
          {/* <div>
            <label className="mb-1 block">Image URL</label>
            <input
              type="text"
              name="image_url"
              value={formik.values.image_url}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full rounded border px-4 py-3 text-black outline-none focus:border-blue-500"
              placeholder="Enter Image URL"
              disabled={isSubmitting}
            />
            {formik.touched.image_url && formik.errors.image_url && (
              <span className="text-sm text-red-500">{formik.errors.image_url}</span>
            )}
          </div> */}

          {/* Role Type */}
          <div>
            <label className="mb-1 text-gray-700 block">Role Type</label>
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
                className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
                disabled={isSubmitting}
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

          {/* Department Name */}
          {/* {(selectedRole.toLowerCase() !== 'admin' && selectedRole.toLowerCase() !== 'super_admin') && ( */}
          {currentUserRole.toLowerCase() !== 'super_admin' && (selectedRole.toLowerCase() !== 'admin' && selectedRole.toLowerCase() !== 'super_admin') && (
            <div className="col-span-1 md:col-span-2">
              <label className="mb-1 text-gray-700 block">Department Name</label>
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
                  className="w-full rounded-xl border border-gray-300 bg-white/70 backdrop-blur-sm px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-300"
                  disabled={isSubmitting}
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
      </div>

      <div className="flex justify-between pt-4">
        <Button label="Cancel" type="button" onClick={onCancel} variant="secondary" disabled={isSubmitting} />
        <Button type="submit" label={isUpdate ? 'Update User' : 'Create User'} variant="primary" disabled={isSubmitting} />
      </div>
    </form>
  );
}