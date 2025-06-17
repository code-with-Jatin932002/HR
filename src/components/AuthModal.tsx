
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
      email: emailValidation,
      password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    }),

    onSubmit: async (values) => {
      setLoading(true);
      setMessage(''); // Clear any previous messages
      setSuccess(false); // Reset success state
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const data = await callApi(
          'post',
          `${baseUrl}/login`,
          {
            email: values.email,
            password: values.password,
          },
          {
            'Content-Type': 'application/json',
          }
        );

        if (data.access_token) {
          setMessage('✅ Login successful! Redirecting...'); // Set the success message
          setSuccess(true); // Set success to true

          // Delay closing modal and redirecting to allow user to see the success message
          setTimeout(() => {
            login(data.access_token, values.email, data.role_type);
            onClose(); // Close the modal after login
            setSuccess(false); // Reset success state after closing
            setMessage(''); // Clear message
            router.replace('/dashboard'); // Navigate after the delay
          }, 1500); // Display for 1.5 seconds before closing and redirecting
        } else {
          // This block might be hit if the API returns 200 but no access_token (unlikely but good for robustness)
          formik.setErrors({ password: 'Login failed' });
          setMessage('Login failed. Please try again.');
          setSuccess(false);
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
        formik.setErrors({ password: errorMsg }); // Set formik error for password field
        setMessage(errorMsg); // Also set general message for display
        setSuccess(false); // Ensure success is false on error
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="fixed inset-0 w-full h-full z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
      {' '}
      {/* Added p-4 for mobile spacing */}
      <div className="bg-white w-full max-w-2xl rounded-lg overflow-hidden shadow-lg flex flex-col md:flex-row">
        {/* Left Side */}
        <div className="hidden md:flex md:w-1/2 bg-blue-100 p-6 flex-col items-center justify-center">
          <img src="/hr1.png" alt="Register" className="w-auto h-[320px] object-contain mb-4" />
          <p className="text-gray-600 text-center text-sm">Welcome! Please sign in to continue.</p>
        </div>
        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-6 md:p-10 relative">
          <h2 className="text-2xl font-bold text-black mb-6 text-center">Sign In</h2>

          <form onSubmit={formik.handleSubmit}>
            {/* Email Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border rounded-lg py-3 px-4 pl-10 text-black outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
              {formik.touched.email && formik.errors.email && (
                <span className="text-sm text-red-500 mt-1 block">{formik.errors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="6+ characters"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border rounded-lg py-3 px-4 pl-10 pr-10 text-black outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
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
                className="w-1/2 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 transition"
                disabled={loading}
              >
                {loading ? <FaSpinner className="animate-spin mr-2" /> : null}
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>

          {/* Success/Error Message Display */}
          {message && (
            <div
              className={`fixed top-[calc(100vh/16)] left-1/2 transform -translate-x-1/2 
                ${
                  success
                    ? 'bg-green-100 border border-green-400 text-green-700'
                    : 'bg-red-100 border border-red-400 text-red-700'
                } 
                text-lg px-6 py-4 rounded-lg shadow-lg z-[60] w-[80%] max-w-xl text-center`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

