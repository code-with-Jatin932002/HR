
'use client';

import { useRouter } from 'next/navigation';
import callApi from '@/utils/callApi';
import { useState } from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Button from './Button';

interface Props {
  onClose: () => void;
}

const validTLDs = ['com', 'org', 'in', 'net', 'edu'];

const emailValidation = Yup.string()
  .required('Email is required')
  .email('Invalid email format')
  .test('no-spaces', 'Email should not contain spaces', (value) => !/\s/.test(value || ''))
  .test('single-at', 'Email must contain only one "@" symbol', (value) => (value?.match(/@/g) || []).length === 1)
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
      setMessage('');
      setSuccess(false);
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
          },
        );

        if (data.access_token && data.role_type) {
          setMessage('✅ Login successful! Redirecting...');
          setSuccess(true);
          setLoading(false);
          setTimeout(() => {
            login(data.access_token, values.email, data.role_type, data.organization_id);
            onClose();
            router.replace('/dashboard');
          }, 1000);
        } else {
          formik.setErrors({ password: 'Login failed: Missing authentication data.' });
          setMessage('Login failed. Please try again.');
          setSuccess(false);
          setLoading(false);
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
        setMessage(errorMsg);
        setSuccess(false);
        setLoading(false);
      }
    },
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm">
      <div className="flex min-h-screen items-start md:items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg md:flex md:overflow-hidden animate-slide-down mt-10 md:mt-0">
          {/* Left Side Image - Desktop only */}
          <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center bg-blue-100 p-6">
            <img src="/hr1.png" alt="Login" className="mb-4 h-[320px] w-auto object-contain" />
            <p className="text-center text-sm text-gray-600">Welcome! Please sign in to continue.</p>
          </div>

          {/* Right Side - Form */}
          <div className="w-full md:w-1/2 p-6 md:p-10 max-h-screen overflow-y-auto">
            <h2 className="mb-6 text-center text-2xl font-bold text-black">Sign In</h2>

            <form onSubmit={formik.handleSubmit}>
              {/* Email */}
              <div className="mb-4">
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full rounded-lg border px-4 pl-10 py-3 text-black outline-none transition focus:ring-2 focus:ring-blue-500"
                  />
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <span className="mt-1 block text-sm text-red-500">{formik.errors.email}</span>
                )}
              </div>

              {/* Password */}
              <div className="mb-6">
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="6+ characters"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full rounded-lg border px-4 pl-10 pr-10 py-3 text-black outline-none transition focus:ring-2 focus:ring-blue-500"
                  />
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label="Toggle Password"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <span className="mt-1 block text-sm text-red-500">{formik.errors.password}</span>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <Button
                  label="Cancel"
                  onClick={onClose}
                  fullWidth
                  variant="secondary"
                  disabled={loading}
                />
                <Button
                  label={loading ? 'Logging...' : 'Login'}
                  type="submit"
                  fullWidth
                  variant="primary"
                  loading={loading}
                />
              </div>
            </form>

            {/* Message */}
            {/* {message && (
              <div
                className={`mt-4 rounded-lg px-4 py-2 text-center text-sm shadow-md ${
                  success
                    ? 'bg-green-100 text-green-700 border border-green-400'
                    : 'bg-red-100 text-red-700 border border-red-400'
                }`}
              >
                {message}
              </div> */}
               {message && (
            <div
              className={`fixed left-1/2 top-[calc(100vh/16)] z-[60] w-[80%] max-w-xl -translate-x-1/2 transform
                ${
                  success
                    ? 'border border-green-400 bg-green-100 text-green-700'
                    : 'border border-red-400 bg-red-100 text-red-700'
                }
                rounded-lg px-6 py-4 text-center text-lg shadow-lg`}
            >
              {message}
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
