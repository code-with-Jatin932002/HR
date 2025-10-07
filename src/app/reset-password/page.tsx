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
import { Suspense } from 'react';

// FIX: Define inputClasses outside the component to resolve the scope error.
// These classes are a direct copy of the input styling from AuthModal.tsx
const inputClasses = (isError: boolean) => `
  w-full rounded-lg border py-4 pl-6 pr-10 text-black outline-none transition duration-300
  ${isError ? 'border-red-500' : 'border-gray-300'} 
  focus:border-purple-600
`;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  // Keep one state for show/hide password for both fields
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState(true);

  // Get the token from the URL on component mount
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setIsTokenValid(true);
    } else {
      setIsTokenValid(false);
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

        toast.success(
          data.message || 'Password reset successful! You can now log in with your new password.',
          { position: 'top-center' }
        );

        // Redirect to the login page
        router.replace('/');
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
      // Full-screen container for the error state, mimicking the modal background
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-50 p-4">
        <div className="text-center p-8 bg-white rounded-lg shadow-2xl max-w-sm w-full animate-scale-fade">
          <h2 className="text-2xl font-bold text-red-600">Invalid Link ❌</h2>
          <p className="mt-4 text-gray-700">
            The password reset link is invalid, missing, or has expired.
          </p>
          <button
            onClick={() => router.replace('/')}
            className="mt-6 w-full px-4 py-3 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition"
          >
            Go to Login Page
          </button>
        </div>
      </div>
    );
  }

  return (
    // Outer container: Full viewport, centers content, uses AuthModal background style
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-50 p-4">
      {/* Main Modal Box: Uses AuthModal styling */}
      <div className="relative w-full max-w-9xl rounded-xl bg-white shadow-2xl md:flex overflow-hidden animate-scale-fade h-full min-h-[80vh]">

        {/* Left Side (Image/SVG): Uses AuthModal styling */}
        <div className="hidden md:flex md:w-1/2 flex-col justify-center items-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white p-10 relative h-200">
          <div className="relative z-10 text-center mt-20 h-90 ">
            <h1 className="text-4xl font-extrabold tracking-tight -mt-30">HR Management</h1>
            <p className="mt-4 text-lg opacity-90">Securely set your new password.</p>
            <p className="mt-1 text-sm opacity-90">All-in-one platform for your HR needs.</p>
            <AuthSvg />
          </div>
        </div>

        {/* Right Side (Form): Uses AuthModal styling */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center min-h-full">
          <h2 className="text-4xl font-bold text-gray-700 mt-4 mb-8 text-center flex-shrink-0">
            Reset Password
          </h2>
          <form onSubmit={formik.handleSubmit}>
            
            {/* New Password Field */}
            {/* <div className="mb-4">
              <label htmlFor="new_password" className="mb-2.5 block text-sm font-medium text-black">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="new_password"
                  name="new_password"
                  placeholder="Enter your new password"
                  value={formik.values.new_password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  // Input Field Class (reused from AuthModal)
                  // className={inputClasses(formik.touched.new_password && !!formik.errors.new_password)}
                />
                <FaLock className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label="Toggle Password Visibility"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formik.touched.new_password && formik.errors.new_password && (
                <span className="mt-1 block text-sm text-red-500">
                  {formik.errors.new_password}
                </span>
              )}
            </div>

            <div className="mb-8"> 
              <label htmlFor="confirm_password" className="mb-2.5 block text-sm font-medium text-black">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirm_password"
                  name="confirm_password"
                  placeholder="Confirm your new password"
                  value={formik.values.confirm_password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  // Input Field Class (reused from AuthModal)
                  // className={inputClasses(formik.touched.confirm_password && !!formik.errors.confirm_password)}
                />
                <FaLock className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label="Toggle Password Visibility"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formik.touched.confirm_password &&
                formik.errors.confirm_password && (
                  <span className="mt-1 block text-sm text-red-500">
                    {formik.errors.confirm_password}
                  </span>
                )}
            </div> */}

            <div className="mb-4">
    {/* Label Style matching the desired look */}
    <label htmlFor="new_password" className="mb-2.5 block text-sm font-medium text-black">
      New Password
    </label>
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        id="new_password"
        name="new_password"
        placeholder="Enter your new password"
        value={formik.values.new_password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        // Input Field Class updated to match email style:
        // py-4, pl-6, border-gray-300, focus:border-purple-600, dynamic error border.
        // pr-20 is used to make space for BOTH the lock icon and the toggle button.
        className={`
          w-full rounded-lg border py-4 pl-6 pr-20 text-black outline-none transition duration-300
          ${
            formik.touched.new_password && formik.errors.new_password ? 'border-red-500' : 'border-gray-300'
          } 
          focus:border-purple-600 
        `}
      />
      {/* Lock icon positioned to the left of the eye/toggle button. right-12 is used 
          to place it next to the toggle button (which is at right-3). */}
      <FaLock className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400" />
      {/* Toggle button position remains at right-3 */}
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        aria-label="Toggle Password Visibility"
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
    {/* Error message block remains the same */}
    {formik.touched.new_password && formik.errors.new_password && (
      <span className="mt-1 block text-sm text-red-500">
        {formik.errors.new_password}
      </span>
    )}
</div>

{/* Confirm Password Field */}
<div className="mb-8"> {/* Increased bottom margin for button separation */}
    {/* Label Style matching the desired look */}
    <label htmlFor="confirm_password" className="mb-2.5 block text-sm font-medium text-black">
      Confirm Password
    </label>
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        id="confirm_password"
        name="confirm_password"
        placeholder="Confirm your new password"
        value={formik.values.confirm_password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        // Input Field Class updated to match email style. 
        // pr-20 is used to make space for both the lock icon and the toggle button.
        className={`
          w-full rounded-lg border py-4 pl-6 pr-20 text-black outline-none transition duration-300
          ${
            formik.touched.confirm_password && formik.errors.confirm_password ? 'border-red-500' : 'border-gray-300'
          } 
          focus:border-purple-600 
        `}
      />
      {/* Lock icon positioned to the left of the eye/toggle button. right-12 is used */}
      <FaLock className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400" />
      {/* Toggle button position remains at right-3 */}
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        aria-label="Toggle Password Visibility"
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
    {/* Error message block remains the same */}
    {formik.touched.confirm_password && formik.errors.confirm_password && (
      <span className="mt-1 block text-sm text-red-500">
        {formik.errors.confirm_password}
      </span>
    )}
</div>
            
            {/* Buttons: Stacked vertically and made full width like AuthModal */}
            <div className="flex flex-col gap-4">
              <Button
                label={loading ? 'Resetting...' : 'Reset Password'}
                type="submit"
                fullWidth
                variant="primary"
                loading={loading}
                // Styling to match the AuthModal primary button
                className="w-full cursor-pointer rounded-lg border border-purple-600 bg-purple-600 py-4 text-white font-semibold transition hover:bg-purple-700 hover:border-purple-700"
              />
              {/* Added a 'Go Back' button for better user experience */}
              <Button
                label="Go to Login"
                onClick={() => router.push('/')}
                fullWidth
                variant="secondary"
                disabled={loading}
                // Styling to match the AuthModal secondary button
                className="w-full cursor-pointer rounded-lg border border-gray-400 bg-gray-500 py-4 text-white font-semibold transition hover:bg-gray-600 hover:border-gray-600"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}