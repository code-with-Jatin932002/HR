'use client';

import { useState } from 'react';
import Swal from 'sweetalert2';
import { FaShieldAlt } from 'react-icons/fa';
import Button from './Button'; // Assuming Button component is in the same directory
import callApi from '@/utils/callApi'; // Assuming callApi utility is available

interface OtpVerificationFormProps {
  /** The email address to which the OTP was sent. This is required for the verification API call. */
  email: string;
  /** Callback function to be called when OTP verification is successful.
   * This typically triggers the redirection to the sign-in page. */
  onVerificationSuccess: () => void;
  /** Callback function to be called when the user cancels the OTP verification process.
   * This typically closes the modal or navigates back. */
  onCancel: () => void;
}

/**
 * OtpVerificationForm component handles the input and verification of a One-Time Password (OTP).
 * It prompts the user to enter the OTP sent to their email and calls the backend API to verify it.
 */
export default function OtpVerificationForm({
  email,
  onVerificationSuccess,
  onCancel,
}: OtpVerificationFormProps) {
  const [otp, setOtp] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false); // State for loading indicator

  /**
   * Handles the OTP verification process when the user submits the OTP.
   * Calls the backend's /organization/verify-otp endpoint.
   */
  const handleOtpVerification = async () => {
    if (!otp) {
      Swal.fire('Error ❌', 'Please enter the OTP.', 'error');
      return;
    }

    setIsVerifying(true); // Start loading

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000'; // Fallback URL
      const otpPayload = {
        email: email, // Use the email passed via props
        otp: otp,
      };

      const response = await callApi('post', `${baseUrl}/organization/verify-otp`, otpPayload, {
        'Content-Type': 'application/json',
      });

      if (response && response.detail === 'OTP verified successfully') {
        Swal.fire('Success ✅', 'Account verified successfully! You can now sign in.', 'success');
        setOtp(''); // Clear OTP field
        onVerificationSuccess(); // Trigger the success callback (e.g., redirect to sign-in)
      } else {
        let errorMessage = 'OTP verification failed. Please try again.';
        if (response && response.detail) {
          errorMessage = response.detail;
        }
        Swal.fire('Error ❌', errorMessage, 'error');
      }
    } catch (err: any) {
      let errorMessage = 'An error occurred during OTP verification.';
      if (err?.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err?.detail) {
        errorMessage = err.detail;
      }
      Swal.fire('Error ❌', errorMessage, 'error');
    } finally {
      setIsVerifying(false); // End loading
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
            id="otp" // Added id for better accessibility
            type="text"
            name="otp"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full border rounded-lg py-3 px-4 pl-10 text-black outline-none focus:border-blue-500"
            maxLength={6} // Assuming OTP is 6 digits
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
        disabled={isVerifying} // Disable button while verifying
      />

      <Button
        type="button"
        onClick={onCancel}
        label="Cancel"
        fullWidth
        variant="secondary"
        className="mt-4 font-semibold"
        disabled={isVerifying} // Disable cancel while verifying
      />

      {/* Optional: Add a "Resend OTP" button - You would add logic here to trigger a resend API call */}
      {/* <button className="w-full mt-2 text-blue-600 hover:text-blue-800 font-semibold cursor-pointer text-sm">
        Resend OTP
      </button> */}
    </div>
  );
}
