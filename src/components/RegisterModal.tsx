
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
}

export default function RegisterModal({ onClose }: Props) {
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
      org_name: Yup.string().required('Organization name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
      role_type: Yup.string().required('Role type is required'),
      address: Yup.string().required('Address is required'),
      phone_number: Yup.string().required('Phone number is required'),
      industry: Yup.string().required('Industry is required'),
      description: Yup.string().required('Description is required'),
      website: Yup.string().required('Website is required'),
      gst_number: Yup.string().required('GST Number is required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
               const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        // const response = await callApi('post', 'http://127.0.0.1:5000/organization', values, {
         const response = await callApi('post', `${baseUrl}/organization`, values, {

          'Content-Type': 'application/json',
        });

        if (!response.detail) {
          Swal.fire('Success ✅', 'Organization registered successfully!', 'success');
          resetForm();
          onClose();
        } else {
          Swal.fire('Error ❌', response.detail, 'error');
        }
      } catch (err: any) {
        Swal.fire('Error ❌', err?.response?.data?.detail || 'Registration failed', 'error');
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
        {/* Left */}
        <div className="hidden md:flex md:w-1/2 bg-blue-100 p-6 items-center justify-center">
          <p className="text-gray-600 text-center">Register your organization as a Super Admin</p>
        </div>

        {/* Right */}
        <div className="w-full md:w-1/2 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-black mb-4 text-center">Organization Register</h2>
          <form onSubmit={formik.handleSubmit}>

            {inputField('org_name', 'text', 'Organization name', FaUser)}
            {inputField('email', 'email', 'Email', FaEnvelope)}

            {/* Password with Toggle */}
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
                  {/* {showPassword ? '🙈' : '👁️'} */}
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <span className="text-sm text-red-500">{formik.errors.password}</span>
              )}
            </div>

            {/* Other Inputs */}
            {inputField('address', 'text', 'Address', FaMapMarkerAlt)}
            {inputField('phone_number', 'text', 'Phone Number', FaPhone)}
            {inputField('industry', 'text', 'Industry', FaIndustry)}
            {inputField('description', 'text', 'Description', FaInfoCircle)}
            {inputField('website', 'text', 'Website', FaGlobe)}
            {inputField('gst_number', 'text', 'GST Number', FaFileInvoice)}

            {/* Role Type Fixed */}
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

            {/* Buttons */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Register Organization
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full mt-4 text-blue-600 hover:text-blue-800 font-semibold"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}







