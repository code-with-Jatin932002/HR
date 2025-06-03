'use client';
import callApi from '@/utils/callApi';
import { useState } from 'react';
import { FaEnvelope, FaLock, FaUser, FaUserTag, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface Props {
  onClose: () => void;
}

export default function RegisterModal({ onClose }: Props) {
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      role_type: 'super_admin',
    },
    validationSchema: Yup.object({
      first_name: Yup.string().required('First name is required'),
      last_name: Yup.string().required('Last name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      // role_type: Yup.string().required('Role type is required'),
        // role_type: Yup.string().required('Please select a role type'),
        role_type: Yup.string()
    .required('Please select a role type')
    .notOneOf([''], 'Please select a role type'),

    }),
    

    onSubmit: async (values, { resetForm }) => {
  try {
    const data = await callApi(
      'post',
      'http://127.0.0.1:5000/register',
      values,
      {
        'Content-Type': 'application/json',
      }
    );

    if (!data.detail) {
      setMessage('✅ Organization registered (super-admin)');
      setSuccess(true);
      resetForm();
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      let errorMsg = 'Registration failed';
      if (Array.isArray(data.detail)) {
        errorMsg = data.detail.map((d: any) => d.msg).join(', ');
      } else if (typeof data.detail === 'string') {
        errorMsg = data.detail;
      }
      setMessage(errorMsg);
    }
  } catch (error: any) {
    let errorMsg = 'An error occurred during registration';
    if (error?.response?.data?.detail) {
      if (Array.isArray(error.response.data.detail)) {
        errorMsg = error.response.data.detail.map((d: any) => d.msg).join(', ');
      } else {
        errorMsg = error.response.data.detail;
      }
    }
    setMessage(errorMsg);
  }
}



  });

  return (
    // <div className="fixed top-0 left-0 w-full h-full z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center">
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto py-10 px-4 flex justify-center items-start">

      <div className="bg-white w-full max-w-2xl rounded-lg overflow-hidden shadow-lg flex flex-col md:flex-row">
        {/* Left Side */}
        <div className="hidden md:flex md:w-1/2 bg-blue-100 p-6 items-center justify-center">
          <p className="text-gray-600 text-center px-4">
            Welcome! Please register to continue.
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-6 md:p-10">
          <h2 className="text-2xl font-bold text-black mb-6 text-center">Register</h2>

          <form onSubmit={formik.handleSubmit}>
            {/* First Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">First Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="first_name"
                  placeholder="Enter your first name"
                  value={formik.values.first_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border rounded-lg py-3 px-4 pl-10 text-black outline-none focus:border-blue-500"
                />
                <FaUser className="absolute left-3 top-4 text-gray-500" />
              </div>
              {formik.touched.first_name && formik.errors.first_name && (
                <span className="text-sm text-red-500 mt-1 block">{formik.errors.first_name}</span>
              )}
            </div>

            {/* Last Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="last_name"
                  placeholder="Enter your last name"
                  value={formik.values.last_name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border rounded-lg py-3 px-4 pl-10 text-black outline-none focus:border-blue-500"
                />
                <FaUser className="absolute left-3 top-4 text-gray-500" />
              </div>
              {formik.touched.last_name && formik.errors.last_name && (
                <span className="text-sm text-red-500 mt-1 block">{formik.errors.last_name}</span>
              )}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border rounded-lg py-3 px-4 pl-10 text-black outline-none focus:border-blue-500"
                />
                <FaEnvelope className="absolute left-3 top-4 text-gray-500" />
              </div>
              {formik.touched.email && formik.errors.email && (
                <span className="text-sm text-red-500 mt-1 block">{formik.errors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border rounded-lg py-3 px-4 pl-10 pr-10 text-black outline-none focus:border-blue-500"
                />
                <FaLock className="absolute left-3 top-4 text-gray-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-4.5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <span className="text-sm text-red-500 mt-1 block">{formik.errors.password}</span>
              )}
            </div>

            {/* Role Type */}
          <div className="mb-6">
  <label className="block text-sm font-medium mb-2">Role Type</label>
  <div className="relative">
    <select
      name="role_type"
      value={formik.values.role_type}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      className={`w-full border rounded-lg py-3 px-4 pl-10 text-black outline-none ${
        formik.touched.role_type && formik.errors.role_type
          ? 'border-red-500'
          : 'focus:border-blue-500'
      }`}
    >
      {/* <option value="">Select Role Type</option> Default placeholder */}
  <option value="" disabled >Select Role Type</option>
      <option value="super_admin">Super Admin</option>
      {/* <option value="admin">Admin</option>
      <option value="employee">Employee</option> */}
    </select>
    <FaUserTag className="absolute left-3 top-3.5 text-gray-500" />
  </div>
  {formik.touched.role_type && formik.errors.role_type && (
    <span className="text-sm text-red-500 mt-1 block">{formik.errors.role_type}</span>
  )}
</div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 cursor-pointer transition font-semibold"
            >
              Register
            </button>

            {/* Success / Error Message */}
            {message && (
              <p className={`mt-4 text-center ${success ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}

            {/* Close Button */}
            <button
              type="button"
              className="w-full mt-4 text-blue-600 hover:text-blue-800 cursor-pointer font-semibold"
              onClick={onClose}
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
