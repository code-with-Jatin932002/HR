'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaShieldAlt } from 'react-icons/fa';
import Button from './Button';
import callApi from '@/utils/callApi';

interface OtpVerificationFormProps {
  email: string;
  onVerificationSuccess: () => void ;
  onCancel: () => void;
}

export default function OtpVerificationForm({
  email,
  onVerificationSuccess,
  onCancel,
}: OtpVerificationFormProps) {
  const [otp, setOtp] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const handleOtpVerification = async () => {
    if (!otp) {
      toast.error('Please enter the OTP.', { position: 'top-center' });
      return;
    }

    setIsVerifying(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
      const otpPayload = {
        email: email,
        otp: otp,
      };

      const response = await callApi('post', `${baseUrl}/organization/verify-otp`, otpPayload, {
        'Content-Type': 'application/json',
      });

      // Centralized success handling:
      // Assuming a successful API call (HTTP 200 series status code) means OTP is verified.
      // The message in `response.detail` is a bonus check.
      const normalizedMessage = response?.detail?.trim().toLowerCase();
      if (normalizedMessage && normalizedMessage.includes('otp verified successfully')) {
        toast.success('Account verified successfully! You can now sign in.', { position: 'top-center' });
        setOtp('');
        // Delay redirection to allow the user to see the success message
        setTimeout(() => {
          onVerificationSuccess();
        }, 1500);
      } else {
        // Handle cases where the API returns a 200 but with an unexpected or failed message.
        // This is a safety net.
        const errorMessage = response?.detail || 'OTP verification failed. Please try again.';
        toast.error(errorMessage, { position: 'top-center' });
      }

    } catch (err: any) {
      // This block will only be executed if the API call truly failed (e.g., HTTP status 400, 500)
      // and not for a successful response with an unexpected status code.
      let errorMessage = 'An unexpected error occurred during OTP verification.';
      if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Check if the error message is the 'OTP verified successfully' message which could be
      // a bug in the backend returning a non-200 status code with a success message.
      // We handle this edge case to prevent the red cross.
      const normalizedErrorMsg = errorMessage.trim().toLowerCase();
      if (normalizedErrorMsg.includes('otp verified successfully')) {
        toast.success('Account verified successfully! You can now sign in.', { position: 'top-center' });
        setOtp('');
        setTimeout(() => {
          onVerificationSuccess();
        }, 1500);
      } else {
        // This is the correct place to show an error toast.
        toast.error(errorMessage, { position: 'top-center' });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="otp-verification-section">
      <p className="text-center text-gray-700 mb-4">
        An OTP has been sent to **{email}**. Please enter it below to verify your account.
      </p>
      <div className="mb-4">
        <label htmlFor="otp" className="block text-sm font-medium mb-1">Enter OTP</label>
        <div className="relative">
          <input
            id="otp"
            type="text"
            name="otp"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full border rounded-lg py-3 px-4 pl-10 text-black outline-none focus:border-blue-500"
            maxLength={6}
          />
          <FaShieldAlt className="absolute left-3 top-4 text-gray-500" />
        </div>
      </div>

      <Button
        type="button"
        label={isVerifying ? 'Verifying...' : 'Verify OTP'}
        fullWidth
        variant="primary"
        onClick={handleOtpVerification}
        disabled={isVerifying}
      />

      <Button
        type="button"
        onClick={onCancel}
        label="Cancel"
        fullWidth
        variant="secondary"
        className="mt-4 font-semibold"
        disabled={isVerifying}
      />
    </div>
  );
}
