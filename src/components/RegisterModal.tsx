'use client';
import { useState, useEffect } from 'react';
import { useFormik, getIn } from 'formik';
import * as Yup from 'yup';
import callApi from '@/utils/callApi';
import toast from 'react-hot-toast';
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaIndustry,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaGlobe,
  FaFileInvoice,
  FaEyeSlash,
  FaEye,
  FaPhone,
} from 'react-icons/fa';
import Button from './Button';
import OtpVerificationForm from './OtpVerificationForm';
import Loader from './Loader';
import AuthRegisterSVG from './AuthSvg';

interface Props {
  onClose: () => void;
  onRegisterSuccessAndRedirectToSignIn: () => void;
}

interface OrganizationType {
  id: string;
  org_type: string;
}

interface OrganizationTypeApiResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  organization_types: OrganizationType[];
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

export default function RegisterModal({ onClose, onRegisterSuccessAndRedirectToSignIn }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [organizationTypes, setOrganizationTypes] = useState<OrganizationType[]>([]);
  const [loadingOrgTypes, setLoadingOrgTypes] = useState(true);
  const [errorOrgTypes, setErrorOrgTypes] = useState<string | null>(null);
  const [loadingRegistration, setLoadingRegistration] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState<string>('');

  useEffect(() => {
    const fetchOrganizationTypes = async () => {
      try {
        setLoadingOrgTypes(true);
        setErrorOrgTypes(null);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
        const response: OrganizationTypeApiResponse = await callApi('get', `${baseUrl}/organization-types/`);
        if (response && Array.isArray(response.organization_types)) {
          setOrganizationTypes(response.organization_types);
        } else {
          setErrorOrgTypes('Invalid data format received for organization types.');
        }
      } catch (err: any) {
        setErrorOrgTypes('Failed to load organization types. Please try again.');
      } finally {
        setLoadingOrgTypes(false);
      }
    };
    fetchOrganizationTypes();
  }, []);

  const formik = useFormik({
    initialValues: {
      org_name: '',
      email: '',
      password: '',
      role_type: 'super_Admin',
      address: '',
      phone_number: '',
      organization_type: '',
      description: '',
      website: '',
      gst_number: '',
    },
    validationSchema: Yup.object({
      org_name: Yup.string()
        .required('Organization name is required')
        .min(3, 'Organization name must be at least 3 characters')
        .matches(
          /^[a-zA-Z][a-zA-Z\s&.-]{2,}$/,
          'Enter a valid organization name (no numbers or special symbols like @, #, $)'
        ),
      email: emailValidation,
      password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
      role_type: Yup.string().required('Role type is required'),
      address: Yup.string()
        .required('Address is required')
        .matches(
          /^[a-zA-Z0-9\s,.-]+$/,
          'Address should not contain special characters @, #, $, %, etc.'
        )
        .max(25, 'Address must be 25 characters only.'),
      phone_number: Yup.string()
        .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits')
        .required('Phone number is required'),
      organization_type: Yup.string().required('Organization type is required'),
      description: Yup.string()
        .required('Description is required')
        .max(100, 'Description must be 100 characters only.'),
      website: Yup.string().url('Enter a valid website URL').required('Website is required'),
      gst_number: Yup.string()
        .matches(
          /^[0-9A-Z]{15}$/,
          'GST Number must be 15 alphanumeric characters and all letters must be capital.'
        )
        .required('GST Number is required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      setLoadingRegistration(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000';
        const payload = {
          ...values,
          role_type: values.role_type,
          organization_type: values.organization_type,
        };
        const response = await callApi('post', `${baseUrl}/organization`, payload, {
          'Content-Type': 'application/json',
        });
        if (response && response.detail && typeof response.detail === 'string' && response.detail.includes('exists')) {
          toast.error(response.detail, { position: 'top-center' });
        } else {
          toast.success('Registration initiated! Please check your email for the OTP.', { position: 'top-center' });
          setRegistrationEmail(values.email);
          setShowOtpVerification(true);
        }
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.detail ||
          err?.detail ||
          err?.response?.data?.message ||
          (err?.response?.data?.errors?.email && Array.isArray(err.response.data.errors.email) && err.response.data.errors.email[0]) ||
          err?.response?.data?.error ||
          (typeof err?.response?.data === 'string' && err.response.data) ||
          err.message ||
          'Registration failed. Please try again.';
        toast.error(errorMessage, { position: 'top-center' });
      } finally {
        setLoadingRegistration(false);
      }
    },
  });

  const inputField = (
    name: string,
    type: string,
    placeholder: string,
    Icon: any,
    isTextArea: boolean = false
  ) => {
    const value = getIn(formik.values, name);
    const error = getIn(formik.errors, name);
    const touched = getIn(formik.touched, name);
    const isPhoneNumber = name === 'phone_number';
    const isGstNumber = name === 'gst_number';

    const commonProps = {
      name,
      placeholder,
      value,
      onChange: (e: any) => {
        let newValue = e.target.value;
        if (isGstNumber) {
          newValue = newValue.toUpperCase();
        }
        formik.setFieldValue(name, newValue);
      },
      onBlur: formik.handleBlur,
      className: 'w-full border rounded-lg py-3 px-4 text-black outline-none focus:border-blue-500',
    };

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 capitalize">{name.replace('_', ' ')}</label>
        <div className="relative">
          {isTextArea ? (
            <textarea {...commonProps} rows={4} />
          ) : (
            <>
              <input
                type={type}
                {...commonProps}
                className={`${commonProps.className} pl-10`}
                maxLength={isPhoneNumber ? 10 : isGstNumber ? 15 : undefined}
                onInput={
                  isPhoneNumber
                    ? (e: any) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                        formik.setFieldValue('phone_number', e.target.value);
                      }
                    : undefined
                }
              />
              <Icon className="absolute left-3 top-4 text-gray-500" />
            </>
          )}
        </div>
        {touched && error && <span className="text-sm text-red-500">{error}</span>}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex justify-center items-start md:items-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg flex flex-col md:flex-row overflow-hidden max-h-[95vh] mt-10 md:mt-0 animate-slide-down">
        <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center bg-blue-100 p-0 relative min-h-[400px]">
          <AuthRegisterSVG />
          <p className="text-gray-600 text-center text-sm mt-4">Register your organization as a Super Admin</p>
        </div>
        <div className="w-full md:w-1/2 p-6 md:p-8 relative flex flex-col min-h-0">
          <h2 className="text-2xl font-bold text-black mb-4 text-center flex-shrink-0">
            {showOtpVerification ? 'Verify Your Account' : 'Organization Register'}
          </h2>
          {loadingRegistration && (
            <div className="absolute inset-0 flex justify-center items-center bg-white/70 backdrop-blur-sm z-10">
              <Loader />
            </div>
          )}
          {!showOtpVerification ? (
            <form onSubmit={formik.handleSubmit} className="flex flex-col flex-grow overflow-y-auto pr-2">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 capitalize">Organization name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="org_name"
                    placeholder="Organization name"
                    value={formik.values.org_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full border rounded-lg py-3 px-4 pl-10 text-black outline-none focus:border-blue-500"
                  />
                  <FaUser className="absolute left-3 top-4 text-gray-500" />
                </div>
                {formik.touched.org_name && formik.errors.org_name && (
                  <span className="text-sm text-red-500">{formik.errors.org_name}</span>
                )}
              </div>
              {inputField('email', 'email', 'Email', FaEnvelope)}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full border rounded-lg py-3 px-4 pl-10 pr-10 text-black outline-none focus:border-blue-500"
                  />
                  <FaLock className="absolute left-3 top-4 text-gray-500" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-4 text-gray-500"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <span className="text-sm text-red-500">{formik.errors.password}</span>
                )}
              </div>
              {inputField('address', 'text', 'Address (Max 25 characters)', FaMapMarkerAlt)}
              {inputField('phone_number', 'text', 'Phone Number', FaPhone)}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Organization Type</label>
                <div className="relative">
                  {loadingOrgTypes ? (
                    <p className="py-3 px-4 pl-10 text-gray-500">Loading organization types...</p>
                  ) : errorOrgTypes ? (
                    <p className="py-3 px-4 pl-10 text-red-500">{errorOrgTypes}</p>
                  ) : (
                    <select
                      name="organization_type"
                      value={formik.values.organization_type}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full border rounded-lg py-3 px-4 pl-10 text-black outline-none focus:border-blue-500"
                    >
                      <option value="">Select Organization Type</option>
                      {organizationTypes.map((type) => (
                        <option key={type.id} value={type.org_type}>
                          {type.org_type}
                        </option>
                      ))}
                    </select>
                  )}
                  <FaIndustry className="absolute left-3 top-3.5 text-gray-500" />
                </div>
                {formik.touched.organization_type && formik.errors.organization_type && (
                  <span className="text-sm text-red-500">{formik.errors.organization_type}</span>
                )}
              </div>
              {inputField('website', 'text', 'Website URL', FaGlobe)}
              {inputField('gst_number', 'text', 'GST Number', FaFileInvoice)}
              {inputField('description', 'text', 'Description (Max 100 characters)', FaInfoCircle, true)}
              <div className="flex-grow"></div>
              <Button
                type="submit"
                label="Register Organization"
                fullWidth
                variant="primary"
                disabled={loadingRegistration}
                className="flex-shrink-0"
              />
              <Button
                type="button"
                onClick={onClose}
                label="Cancel"
                fullWidth
                variant="secondary"
                className="mt-4 font-semibold flex-shrink-0"
                disabled={loadingRegistration}
              />
            </form>
          ) : (
            <OtpVerificationForm
              email={registrationEmail}
              onVerificationSuccess={onRegisterSuccessAndRedirectToSignIn}
              onCancel={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}