// src/components/ForgotPasswordModal.tsx

'use client';

import { useState } from 'react';
import { FaEnvelope } from 'react-icons/fa';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Button from './Button';
import toast from 'react-hot-toast';
import callApi from '@/utils/callApi';

interface Props {
  onClose: () => void;
  onBackToLogin: () => void;
}

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
    const validTLDs = ['com', 'org', 'in', 'net', 'edu'];
    const domainParts = value.split('.');
    const tld = domainParts[domainParts.length - 1];
    return validTLDs.includes(tld.toLowerCase());
  });

export default function ForgotPasswordModal({ onClose, onBackToLogin }: Props) {
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object({
      email: emailValidation,
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const data = await callApi(
          'post',
          `${baseUrl}/forgot-password`,
          { email: values.email },
          { 'Content-Type': 'application/json' }
        );

        toast.success(data.message || 'Password reset link sent to your email.', {
          position: 'top-center',
        });
        
        onClose(); // Close the modal on success
      } catch (error: any) {
        let errorMsg = 'An unexpected error occurred. Please try again.';

        if (error.response?.data?.message) {
          errorMsg = error.response.data.message;
        } else if (error.response?.data?.detail) {
          errorMsg = Array.isArray(error.response.data.detail) ? 
            error.response.data.detail.map((d: any) => d.msg).join(', ') :
            error.response.data.detail;
        }

        toast.error(errorMsg, {
          position: 'top-center',
        });
        setLoading(false);
      }
    },
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm">
      <div className="flex min-h-screen items-start md:items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-lg bg-white shadow-lg md:flex md:overflow-hidden animate-slide-down mt-10 md:mt-0">
          <div className="w-full p-6 md:p-10 max-h-screen overflow-y-auto flex flex-col justify-center">
            <h2 className="mb-6 text-center text-2xl font-bold text-black">Forgot Password</h2>
            <p className="text-center text-sm text-gray-600 mb-6">
              Enter your email address to receive a password reset link.
            </p>
            <form onSubmit={formik.handleSubmit}>
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
              <div className="flex gap-4">
                <Button
                  label="Back to Login"
                  onClick={onBackToLogin}
                  fullWidth
                  variant="secondary"
                  disabled={loading}
                />
                <Button
                  label={loading ? 'Sending...' : 'Send Link'}
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