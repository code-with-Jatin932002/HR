// src/components/ForgotPasswordModal.tsx
'use client';

import { useState } from 'react';
import { FaEnvelope } from 'react-icons/fa';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Button from './Button';
import toast from 'react-hot-toast';
import callApi from '@/utils/callApi';
import Image from 'next/image';

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
    initialValues: { email: '' },
    validationSchema: Yup.object({ email: emailValidation }),
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

        toast.success(data.message || 'Password reset link sent to your email.', { position: 'top-center' });
        onClose();
      } catch (error: any) {
        let errorMsg = 'An unexpected error occurred. Please try again.';
        if (error.response?.data?.message) errorMsg = error.response.data.message;
        else if (error.response?.data?.detail)
          errorMsg = Array.isArray(error.response.data.detail)
            ? error.response.data.detail.map((d: any) => d.msg).join(', ')
            : error.response.data.detail;
        toast.error(errorMsg, { position: 'top-center' });
        setLoading(false);
      }
    },
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-purple-50">
      <div className="flex min-h-screen items-start md:items-center justify-center p-4">
        <div className="w-full max-w-6xl rounded-lg bg-white shadow-lg md:flex md:overflow-hidden animate-slide-down mt-10 md:mt-0 h-150">
          {/* Left: Form */}
          <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center">
            <h2 className="mb-6 text-center text-3xl font-bold text-purple-700">
              Forgot Password
            </h2>
            <p className="text-center text-sm text-gray-600 mb-6">
              Enter your email address to receive a password reset link.
            </p>
            <form onSubmit={formik.handleSubmit}>
              {/* <div className="mb-4">
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
                    className="w-full rounded-xl border border-gray-300 px-11 py-3 text-gray-700 placeholder-gray-400 outline-none shadow-sm transition duration-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                  />
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <span className="mt-1 block text-sm text-red-500">{formik.errors.email}</span>
                )}
              </div> */}
              <div className="mb-4">
    {/* Updated Label Style */}
    <label htmlFor="email" className="mb-2.5 block text-sm font-medium text-black">Email Address</label> 
    <div className="relative">
      <input
        type="email"
        id="email"
        name="email"
        placeholder="Enter your email"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        // Input Field Class updated to match the desired style
        className={`
          w-full rounded-lg border py-4 pl-6 pr-10 text-black outline-none transition duration-300
          ${
            // Dynamic border for validation feedback
            formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-gray-300'
          } 
          focus:border-purple-600 
        `} 
      />
      {/* Icon repositioned and recolored for the new style */}
      <FaEnvelope className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
    </div>
    {/* Error message block remains the same, using Formik validation */}
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
                  className='rounded-xl h-10 border-gray-300 text-white-600 bg-gray-500 hover:bg-gray-700 py-3 font-medium transition'
                />
                <Button
                  label={loading ? 'Sending...' : 'Send Link'}
                  type="submit"
                  fullWidth
                  variant="primary"
                  loading={loading}
                  className='rounded-xl h-10 border-purple-300 text-white-600 bg-purple-600 hover:bg-purple-700 py-3 font-medium transition'
                />
              </div>
            </form>
          </div>
  {/* Right: Illustration */}
    
          <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 justify-center items-center p-6">
            <Image
              src="aaa.svg"
              alt="Forgot Password Illustration"
              width={400}
              height={400}
              className="object-contain"
            />
         </div>
        </div>
      </div>
    </div>
  );
}
