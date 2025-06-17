
'use client';
import { useState } from 'react';
import { useFormik, getIn } from 'formik';
import * as Yup from 'yup';
import callApi from '@/utils/callApi';
import Swal from 'sweetalert2';
import {
  FaEnvelope, FaLock, FaUser, FaUserTag, FaPhone,
  FaIndustry, FaMapMarkerAlt, FaInfoCircle, FaGlobe, FaFileInvoice, FaEyeSlash, FaEye
} from 'react-icons/fa';

interface Props {
  onClose: () => void;
  // New prop to handle redirection to sign-in after successful registration
  onRegisterSuccessAndRedirectToSignIn: () => void;
}

const validTLDs = ['com', 'org', 'in', 'net', 'edu'];

const emailValidation = Yup.string()
  .required('Email is required')
  .email('Invalid email format') // Basic email format
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

export default function RegisterModal({ onClose, onRegisterSuccessAndRedirectToSignIn }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      org_name: '',
      email: '',
      password: '',
      role_type: 'super_Admin',
      address: '',
      phone_number: '',
      industry: '',
      description: '',
      website: '',
      gst_number: '',
    },
    validationSchema: Yup.object({
      org_name: Yup.string()
        .required('Organization name is required')
        .min(3, 'Organization name must be at least 3 characters')
        .matches(
          /^[a-zA-Z][a-zA-Z\s&.-]{2,}$/,
          'Enter a valid organization name (no numbers or special symbols like @, #, $)'
        ),
      email: emailValidation,
      password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
      role_type: Yup.string().required('Role type is required'),
      address: Yup.string()
        .required('Address is required')
        .matches(
          /^[a-zA-Z0-9\s,.-]+$/,
          'Address should not contain special characters @, #, $, %, etc.'
        ),
      phone_number: Yup.string()
        .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
        .required('Phone number is required'),
      industry: Yup.string().required('Industry is required'),
      description: Yup.string()
        .required('Description is required'),
      website: Yup.string().url('Enter a valid website URL').required('Website is required'),
      gst_number: Yup.string()
        .matches(/^[0-9A-Z]{15}$/, 'GST Number must be 15 characters')
        .required('GST Number is required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;

        const response = await callApi('post', `${baseUrl}/organization`, values, {
          'Content-Type': 'application/json',
        });

        
        if (response && response.detail && typeof response.detail === 'string') {
          Swal.fire('Error ❌', response.detail, 'error');
        } else {
          Swal.fire('Success ✅', 'Organization registered successfully!', 'success');
          resetForm();
          onClose(); // Close the register modal
          onRegisterSuccessAndRedirectToSignIn(); // Trigger opening of sign-in modal
        }
      } catch (err: any) {
        let errorMessage = 'Registration failed. Please try again.'; // Default message

        // console.error('Registration API Error:', err); // Log the full error object for debugging

        // Attempt to extract the specific error message from the backend response
        if (err?.response?.data?.detail) {
          // This is the most common path for an "email already registered" error
          // from a backend, especially with frameworks like FastAPI/Django REST Framework.
          errorMessage = err.response.data.detail;
        } else if (err?.detail) {
          // Fallback if 'detail' is directly on the error object (less common but possible)
          errorMessage = err.detail;
        } else if (err?.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err?.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err?.response?.data?.errors?.email && Array.isArray(err.response.data.errors.email)) {
          // For validation errors specifically on the 'email' field
          errorMessage = err.response.data.errors.email[0];
        } else if (typeof err?.response?.data === 'string') {
          // If the backend sends a plain string as the error response body
          errorMessage = err.response.data;
        } else if (err.message) {
          // Generic network errors or JavaScript errors
          errorMessage = err.message;
        }

        Swal.fire('Error ❌', errorMessage, 'error');
      }
    },
  });

  const inputField = (
    name: string,
    type: string,
    placeholder: string,
    Icon: any
  ) => {
    const value = getIn(formik.values, name);
    const error = getIn(formik.errors, name);
    const touched = getIn(formik.touched, name);

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 capitalize">{name.replace('_', ' ')}</label>
        <div className="relative">
          <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border rounded-lg py-3 px-4 pl-10 text-black outline-none focus:border-blue-500"
          />
          <Icon className="absolute left-3 top-4 text-gray-500" />
        </div>
        {touched && error && (
          <span className="text-sm text-red-500">{error}</span>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto py-10 px-4 flex justify-center items-start">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg flex flex-col md:flex-row overflow-hidden">
        {/* Left Side with Image */}
        <div className="hidden md:flex md:w-1/2 bg-blue-100 p-6 flex-col items-center justify-center">
          <img
            src="/hr5.png"
            alt="Register"
            className="w-auto h-[950px] object-contain mb-4"
          />
          <p className="text-gray-600 text-center text-sm">
            Register your organization as a Super Admin
          </p>
        </div>

        {/* Right Side Form */}
        <div className="w-full md:w-1/2 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-black mb-4 text-center">Organization Register</h2>
          <form onSubmit={formik.handleSubmit}>

            {inputField('org_name', 'text', 'Organization name', FaUser)}
            {inputField('email', 'email', 'Email', FaEnvelope)}

            {/* Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border rounded-lg py-3 px-4 pl-10 pr-10 text-black outline-none focus:border-blue-500"
                />
                <FaLock className="absolute left-3 top-4 text-gray-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-4 text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <span className="text-sm text-red-500">{formik.errors.password}</span>
              )}
            </div>

            {/* Address */}
            {inputField('address', 'text', 'Address', FaMapMarkerAlt)}
            {inputField('phone_number', 'text', 'Phone Number', FaPhone)}

            {/* Industry Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Industry</label>
              <div className="relative">
                <select
                  name="industry"
                  value={formik.values.industry}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border rounded-lg py-3 px-4 pl-10 text-black outline-none focus:border-blue-500"
                >
                  <option value="">Select Industry</option>
                  <option value="IT">IT</option>
                  <option value="Software">Software</option>
                  <option value="Research">Research</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                </select>
                <FaIndustry className="absolute left-3 top-3.5 text-gray-500" />
              </div>
              {formik.touched.industry && formik.errors.industry && (
                <span className="text-sm text-red-500">{formik.errors.industry}</span>
              )}
            </div>

            {/* Description */}
            {inputField('description', 'text', 'Description', FaInfoCircle)}
            {inputField('website', 'text', 'Website URL', FaGlobe)}
            {inputField('gst_number', 'text', 'GST Number', FaFileInvoice)}

            {/* Role Type (Disabled) */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Role Type</label>
              <div className="relative">
                <select
                  name="role_type"
                  value={formik.values.role_type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border rounded-lg py-3 px-4 pl-10 text-black outline-none focus:border-blue-500"
                  disabled
                >
                  <option value="super_Admin">Super Admin</option>
                </select>
                <FaUserTag className="absolute left-3 top-3.5 text-gray-500" />
              </div>
            </div>

            {/* Submit + Cancel */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold cursor-pointer"
            >
              Register Organization
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full mt-4 text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}