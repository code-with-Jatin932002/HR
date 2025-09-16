// src/app/reset-password/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import callApi from '@/utils/callApi';
import toast from 'react-hot-toast';
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import Button from '@/components/Button';
import AuthSvg from '@/components/AuthSvg';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState(false);

  // Get the token from the URL on component mount
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setIsTokenValid(true);
    } else {
      setIsTokenValid(false);
      toast.error('Invalid password reset link. Missing token.', { position: 'top-center' });
    }
  }, [searchParams]);

  const formik = useFormik({
    initialValues: {
      new_password: '',
      confirm_password: '',
    },
    validationSchema: Yup.object({
      new_password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('New password is required'),
      confirm_password: Yup.string()
        .oneOf([Yup.ref('new_password')], 'Passwords must match')
        .required('Confirm password is required'),
    }),
    onSubmit: async (values) => {
      if (!token) {
        toast.error('Token not found. Please use the link from your email.', { position: 'top-center' });
        return;
      }
      setLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const data = await callApi(
          'post',
          `${baseUrl}/reset-password`,
          {
            token,
            new_password: values.new_password,
          },
          { 'Content-Type': 'application/json' }
        );

        toast.success(data.message || 'Password reset successful! You can now log in with your new password.', {
          position: 'top-center',
        });
        
        router.push('/'); // Redirect to the login page
      } catch (error: any) {
        let errorMsg = 'An unexpected error occurred. Please try again.';
        if (error.response?.data?.detail) {
          errorMsg = error.response.data.detail;
        }

        toast.error(errorMsg, {
          position: 'top-center',
        });
        setLoading(false);
      }
    },
  });

  if (!isTokenValid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-red-600">Invalid Link</h2>
          <p className="mt-2 text-gray-700">The password reset link is invalid or has expired.</p>
          <button onClick={() => router.push('/login')} className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm">
      <div className="flex min-h-screen items-start md:items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg md:flex md:overflow-hidden animate-slide-down mt-10 md:mt-0">
          <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center bg-blue-100 p-0 relative min-h-[400px]">
            <AuthSvg />
          </div>
          <div className="w-full md:w-1/2 p-6 md:p-10 max-h-screen overflow-y-auto flex flex-col justify-center">
            <h2 className="mb-6 text-center text-2xl font-bold text-black">Set New Password</h2>
            <form onSubmit={formik.handleSubmit}>
              <div className="mb-4">
                <label htmlFor="new_password" className="mb-2 block text-sm font-medium text-gray-700">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="new_password"
                    name="new_password"
                    placeholder="Enter your new password"
                    value={formik.values.new_password}
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
                {formik.touched.new_password && formik.errors.new_password && (
                  <span className="mt-1 block text-sm text-red-500">{formik.errors.new_password}</span>
                )}
              </div>
              <div className="mb-6">
                <label htmlFor="confirm_password" className="mb-2 block text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirm_password"
                    name="confirm_password"
                    placeholder="Confirm your new password"
                    value={formik.values.confirm_password}
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
                {formik.touched.confirm_password && formik.errors.confirm_password && (
                  <span className="mt-1 block text-sm text-red-500">{formik.errors.confirm_password}</span>
                )}
              </div>
              <div className="flex gap-4">
                <Button
                  label={loading ? 'Resetting...' : 'Reset Password'}
                  type="submit"
                  fullWidth
                  variant="primary"
                  loading={loading}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}