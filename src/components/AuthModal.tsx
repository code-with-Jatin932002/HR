// src/components/AuthModal.tsx
'use client';

import { useRouter } from 'next/navigation';
import callApi from '@/utils/callApi';
import { useState } from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Button from './Button';
import toast from 'react-hot-toast';
import AuthSvg from './AuthSvg';
import ForgotPasswordModal from './ForgotPasswordModal';
import RegisterModal from './RegisterModal';

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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const [showRegisterModal, setShowRegisterModal] = useState(false); 
  const [initialRegisterState, setInitialRegisterState] = useState<{ showOtpVerification: boolean; registrationEmail: string } | undefined>(undefined);
  
  const [isUnverified, setIsUnverified] = useState(false);
  
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
      setIsUnverified(false);
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
          toast.success('Login successful! Redirecting...', {
            position: 'top-center',
            duration : 3000,
          });

          // Extract IDs based on API response structure
          const organizationId = data.user?.organization_id || data.organization?.id;
          const userId = data.user?.id;

          // Call the login function with the extracted IDs
          login(data.access_token, values.email, data.role_type, userId, organizationId);
          
          router.replace('/dashboard');
          onClose();
        } else {
          const errorMsg = 'Login failed: Missing authentication data.';
          formik.setErrors({ password: errorMsg });
          toast.error(errorMsg, {
            position: 'top-center',
          });
          setLoading(false);
        }
      } catch (error: any) {
        let errorMsg = 'An unexpected error occurred. Please try again.';
        const responseDetail = error.response?.data?.detail;

        if (responseDetail && typeof responseDetail === 'string' && responseDetail.toLowerCase().includes('account is not active')) {
          setInitialRegisterState({ showOtpVerification: true, registrationEmail: values.email });
          setIsUnverified(true);
          errorMsg = 'Account is not active. Please verify your email with the OTP.';
          formik.setErrors({ password: errorMsg });
        } else if (error.response) {
          if (error.response.status === 401 && responseDetail) {
            errorMsg = responseDetail;
          } else if (responseDetail) {
            if (Array.isArray(responseDetail)) {
              errorMsg = responseDetail.map((d: any) => d.msg).join(', ');
            } else {
              errorMsg = responseDetail;
            }
          } else if (error.response.status === 404) {
            errorMsg = 'Endpoint not found. Please check the API URL.';
          } else {
            if (responseDetail && Array.isArray(responseDetail)) {
              const validationErrors = responseDetail.map((err: any) => `${err.loc.join('.') || 'field'} - ${err.msg}`).join('; ');
              errorMsg = `Validation failed: ${validationErrors}`;
            } else {
              errorMsg = `Error: ${error.response.status} - ${error.response.statusText || 'Something went wrong!'}`;
            }
          }
          formik.setErrors({ password: errorMsg });
        } else if (error.request) {
          errorMsg = 'No response from server. Please check your internet connection.';
          formik.setErrors({ password: errorMsg });
        } else {
          errorMsg = error.message || 'An unknown error occurred.';
          formik.setErrors({ password: errorMsg });
        }
      } finally {
        setLoading(false);
      }
    },
  });
  
  const handleVerifyClick = () => {
    setInitialRegisterState({
      showOtpVerification: true,
      registrationEmail: formik.values.email
    });
    setShowRegisterModal(true);
  };

  if (showForgotPassword) {
    return <ForgotPasswordModal onClose={() => {
        setShowForgotPassword(false);
        onClose();
    }} onBackToLogin={() => setShowForgotPassword(false)} />;
  }

  if (showRegisterModal) {
    return <RegisterModal
      onClose={() => {
        setShowRegisterModal(false);
        setInitialRegisterState(undefined);
      }}
      onRegisterSuccessAndRedirectToSignIn={() => {
        setShowRegisterModal(false);
        setInitialRegisterState(undefined);
        onClose();
      }}
      initialState={initialRegisterState}
    />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-50">
      <div className="relative w-full max-w-9xl rounded-xl bg-white shadow-2xl md:flex overflow-hidden animate-scale-fade">
        <div className="hidden md:flex md:w-1/2 flex-col justify-center items-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white p-10 relative  h-200">
         <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-2xl h-10"></div>
            <div className="relative z-10 text-center mt-20 h-90 ">
             <h1 className="text-4xl font-extrabold tracking-tight -mt-30">HR Management</h1>
                <p className="mt-4 text-lg opacity-90">Simplify HR tasks and keep your team productive.
                 All-in-one platform to manage employees, payroll, and performance.</p>
                <p></p>
                <AuthSvg />
              </div>
        </div>
          <div className="w-full md:w-1/2 p-8 md:p-12 max-h-[90vh] overflow-y-auto flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-gray-700 mb-4 text-center flex-shrink-0">Sign In</h2>
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
                    className="w-full rounded-2xl border border-gray-300 px-11 py-3 text-gray-700 placeholder-gray-400 outline-none shadow-sm transition duration-300  focus:ring-2"
                  />
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <span className="mt-1 block text-sm text-red-500">{formik.errors.email}</span>
                )}
              </div>
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
                    className="w-full rounded-2xl border border-gray-300 px-11 py-3 text-gray-700 placeholder-gray-400 outline-none shadow-sm transition duration-300  focus:ring-2"
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
                {isUnverified && (
                  <div className="mt-2 text-sm text-blue-500 hover:text-blue-700 cursor-pointer text-right">
                    <span onClick={handleVerifyClick} className="font-semibold">
                      Verify with OTP
                    </span>
                  </div>
                )}
              </div>
              <div className="text-right mb-4">
                  <span className="text-sm text-gray-600 mr-1"> You Don't remember it</span>

                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-500 hover:text-blue-700 cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="flex gap-4">
                <Button
                  label="Cancel"
                  onClick={onClose}
                  fullWidth
                  variant="secondary"
                  disabled={loading}
                   className="rounded-xl h-10 border-gray-300 text-white-600 bg-gray-500 hover:bg-gray-700 py-3 font-medium transition"
                />
                <Button
                  label={loading ? 'Logging...' : 'Login'}
                  type="submit"
                  fullWidth
                  variant="primary"
                  loading={loading}
                   className="rounded-xl h-10 border-purple-300 text-white-600 bg-purple-600 hover:bg-purple-700 py-3 font-medium transition"
                />
              </div>
            </form>
          </div>
        </div>
      </div>

  );
}
