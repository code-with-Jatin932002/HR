
'use client';

import { useRouter } from 'next/navigation';

import callApi from '@/utils/callApi';
import { useState } from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface Props {
  onClose: () => void;
}

export default function AuthModal({ onClose }: Props) {
  const { login } = useAuth();
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();


  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      // email: Yup.string().email('Invalid email address').required('Email is required'),
        email: Yup.string()
    .email('Invalid email address')
    .required('Email is required')
    .test(
      'ends-with-com',
      'Email must end with .com',
      (value) => value?.endsWith('.com')
    )
    .test(
      'valid-domain',
      'Email must be from @gmail or @email',
      (value) =>
        value?.includes('@gmail.com') || value?.includes('@email.com')
    ),
      password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    }),

    onSubmit: async (values) => {
      setLoading(true);
      try {
        const data = await callApi(
          'post',
          'http://127.0.0.1:5000/login',
          {
            email: values.email,
            password: values.password,
          },
          {
            'Content-Type': 'application/json',
          }
        );

        if (data.access_token) {
          setMessage('✅ Login successful!');
          setSuccess(true);
          localStorage.setItem('token', data.access_token);
          localStorage.setItem('role_type', data.role_type);

          setTimeout(() => {
            login(data.access_token);
            onClose();
          }, 1500);
        }
        
         else {
          formik.setErrors({ password: 'Login failed' });
        }
      } catch (error: any) {
        let errorMsg = 'Invalid Email and Password!';
        if (error?.response?.data?.detail) {
          if (Array.isArray(error.response.data.detail)) {
            errorMsg = error.response.data.detail.map((d: any) => d.msg).join(', ');
          } else {
            errorMsg = error.response.data.detail;
          }
        }
        formik.setErrors({ password: errorMsg });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="fixed top-0 left-0 w-full h-full z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center">
      <div className="bg-white w-full max-w-2xl rounded-lg overflow-hidden shadow-lg flex flex-col md:flex-row">
        {/* Left Side */}
        <div className="hidden md:flex md:w-1/2 bg-gray-100 p-6 items-center justify-center">
          <p className="text-gray-600 text-center px-4">
            Welcome! Please sign in to continue.
          </p>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-6 md:p-10 relative">
          <h2 className="text-2xl font-bold text-black mb-6 text-center">Sign In</h2>

          <form onSubmit={formik.handleSubmit}>
            {/* Email Field */}
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

            {/* Password Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="6+ characters"
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

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading}
              >
                {loading ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : null}
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>

          {success && (
  <div className="fixed top-1/16 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 text-lg px-6 py-4 rounded-lg shadow-lg z-50 w-[80%] max-w-xl text-center">
     {message}
  </div>
)}
        </div>
      </div>
    </div>
  );
}
















