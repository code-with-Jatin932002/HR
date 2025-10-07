// src/components/RegisterModal.tsx - UPDATED FOR STYLING AND HEIGHT CONSISTENCY
'use client';
import { useState, useEffect } from 'react';
import { useFormik, getIn } from 'formik';
import * as Yup from 'yup';
import callApi from '@/utils/callApi';
import toast from 'react-hot-toast';
import Select from 'react-select'; 
import { Country, State, City } from 'country-state-city';
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
  FaGlobeAmericas,
  FaFlag,
  FaMapMarkedAlt,
  FaCaretDown,
} from 'react-icons/fa';
import Button from './Button';
import OtpVerificationForm from './OtpVerificationForm';
import Loader from './Loader';
import AuthSvg from './AuthSvg';
import 'flag-icons/css/flag-icons.min.css'; 

// ... (Interface and Validation Code remains the same) ...
interface InitialState {
  showOtpVerification: boolean;
  registrationEmail: string;
}

interface Props {
  onClose: () => void;
  onRegisterSuccessAndRedirectToSignIn?: () => void;
  initialState?: InitialState;
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

// 🌟 FIX 1: Standardized height/padding for all regular inputs 
const BASE_INPUT_CLASSES = `
  w-full rounded-lg border h-[52px] py-4 pl-10 pr-4 text-black outline-none transition duration-300
  focus:border-purple-600 focus:shadow-md
`;
const ERROR_CLASS = 'border-red-500';
const NORMAL_CLASS = 'border-gray-300';

// 🌟 FIX 2: Re-added 'appearance-none' to remove the native dropdown arrow, relying only on FaCaretDown
const SELECT_BASE_CLASSES = `
  w-full rounded-lg border h-[52px] py-3 pl-10 pr-4 text-black outline-none transition duration-300
  focus:border-purple-600 focus:shadow-md bg-white disabled:cursor-not-allowed appearance-none
`;

export default function RegisterModal({ onClose, onRegisterSuccessAndRedirectToSignIn, initialState }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [organizationTypes, setOrganizationTypes] = useState<OrganizationType[]>([]);
  const [loadingOrgTypes, setLoadingOrgTypes] = useState(true);
  const [errorOrgTypes, setErrorOrgTypes] = useState<string | null>(null);
  const [loadingRegistration, setLoadingRegistration] = useState(false);

  const [countries, setCountries] = useState<any[]>([]);
  const [countryCodes, setCountryCodes] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  const [showOtpVerification, setShowOtpVerification] = useState(initialState?.showOtpVerification || false);
  const [registrationEmail, setRegistrationEmail] = useState<string>(initialState?.registrationEmail || '');

  // Effect to fetch organization types
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

    if (!initialState?.showOtpVerification) {
      fetchOrganizationTypes();
    }
  }, [initialState?.showOtpVerification]);

  // Effect to load countries and country codes from the local library
  useEffect(() => {
    const formattedCountries = Country.getAllCountries().map(country => ({
      value: country.isoCode,
      label: country.name,
      countryData: country,
    }));
    setCountries(formattedCountries);

    const formattedCountryCodes = Country.getAllCountries().map(country => ({
      value: country.phonecode,
      label: `${country.phonecode}`, // Just show the code in the label
      isoCode: country.isoCode,
    }));
    setCountryCodes(formattedCountryCodes);
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
      country: '',
      country_code: '',
      state: '',
      city: '',
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
      password: Yup.string()
        .min(8, 'Password must be at least 8 characters long')
        .matches(/[0-9]/, 'Password requires at least one number')
        .matches(/[A-Z]/, 'Password requires at least one uppercase letter')
        .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]/, 'Password requires at least one symbol')
        .required('Password is required'),
      role_type: Yup.string().required('Role type is required'),
      address: Yup.string().required('Address is required').max(35, 'Address must be at most 35 characters.'),
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
      country: Yup.string().required('Country is required'),
      country_code: Yup.string().required('Country code is required'),
      state: Yup.string().required('State is required'),
      city: Yup.string().required('City is required'),
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
          resetForm(); 
        }
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.detail ||
          err?.detail ||
          err?.response?.data?.message ||
          (err?.response?.data?.errors?.email && Array.isArray(err.response.data.errors.email) && err.response.data.errors[0]) ||
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

  // HELPER FUNCTION TO RESET STATE AND FORMIK
  const resetFormAndState = () => {
    formik.resetForm();
    setStates([]);
    setCities([]);
    setShowOtpVerification(false);
  }

  const handleCountryChange = (selectedOption: any) => {
    if (!selectedOption) {
      formik.setFieldValue('country', '');
      formik.setFieldValue('country_code', '');
      formik.setFieldValue('state', '');
      formik.setFieldValue('city', '');
      setStates([]);
      setCities([]);
      return;
    }

    const selectedCountry = selectedOption.countryData;
    formik.setFieldValue('country', selectedCountry.name);
    formik.setFieldValue('country_code', selectedCountry.phonecode);

    const countryStates = State.getStatesOfCountry(selectedCountry.isoCode);
    setStates(countryStates);
    setCities([]);
    formik.setFieldValue('state', '');
    formik.setFieldValue('city', '');
  };

  const handleCountryCodeChange = (selectedOption: any) => {
    if (!selectedOption) {
      formik.setFieldValue('country', '');
      formik.setFieldValue('country_code', '');
      formik.setFieldValue('state', '');
      formik.setFieldValue('city', '');
      setStates([]);
      setCities([]);
      return;
    }
    const country = Country.getAllCountries().find(c => c.phonecode === selectedOption.value);
    if (country) {
      formik.setFieldValue('country', country.name);
      formik.setFieldValue('country_code', country.phonecode);
      const countryStates = State.getStatesOfCountry(country.isoCode);
      setStates(countryStates);
      setCities([]);
      formik.setFieldValue('state', '');
      formik.setFieldValue('city', '');
    }
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedStateName = e.target.value;
    formik.setFieldValue('state', selectedStateName);
    formik.setFieldValue('city', '');
    setCities([]);

    const selectedCountry = countries.find(option => option.label === formik.values.country);
    if (selectedCountry && selectedStateName) {
      const state = states.find(s => s.name === selectedStateName);
      if (state) {
        const citiesOfState = City.getCitiesOfState(selectedCountry.value, state.isoCode);
        setCities(citiesOfState);
      }
    }
  };
  
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
    const isGstNumber = name === 'gst_number';
    const isAddress = name === 'address';
    const hasError = touched && error;

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
      className: `${BASE_INPUT_CLASSES} ${hasError ? ERROR_CLASS : NORMAL_CLASS}`,
    };

    return (
      <div className="mb-2">
        <label className="mb-2 block text-sm font-medium text-gray-700 capitalize">{name.replace('_', ' ')}</label>
        <div className="relative">
          {isTextArea ? (
            // 🌟 FIX 1: Adjusted textarea height/padding
            <textarea {...commonProps} rows={3} className={`${commonProps.className} h-auto min-h-[52px] pl-4 pr-4 !py-3`} />
          ) : (
            <>
              <input
                type={type}
                {...commonProps}
                maxLength={isGstNumber ? 15 : isAddress ? 35 : undefined}
                onInput={
                  isGstNumber
                    ? (e: any) => {
                        e.target.value = e.target.value.toUpperCase().slice(0, 15);
                        formik.setFieldValue('gst_number', e.target.value);
                      }
                    : undefined
                }
              />
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </>
          )}
        </div>
        {hasError && <span className="mt-1 block text-sm text-red-500">{error}</span>}
      </div>
    );
  };

  // Custom styles for react-select to match the general input styling
  const selectCustomStyles = (hasError: boolean) => ({
    control: (base: any, state: { isFocused: boolean }) => ({
      ...base,
      // 🌟 FIX 1: Set explicit height to match native inputs
      minHeight: '52px', 
      height: '52px',
      padding: '0.2rem 0', 
      borderRadius: '0.5rem',
      borderColor: hasError ? '#ef4444' : (state.isFocused ? '#7c3aed' : '#d1d5db'), 
      boxShadow: state.isFocused ? '0 0 0 1px #7c3aed' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#7c3aed' : '#9ca3af',
      },
      backgroundColor: 'white',
      paddingLeft: '1.2rem', 
    }),
    placeholder: (base: any) => ({
      ...base,
      color: '#9ca3af', 
      marginLeft: '0.5rem',
    }),
    singleValue: (base: any) => ({
        ...base,
        color: 'black',
        marginLeft: '0.5rem',
    }),
    indicatorsContainer: (base: any) => ({
        ...base,
        height: '100%',
    }),
    dropdownIndicator: (base: any) => ({
        ...base,
        padding: '8px',
    }),
  });

  const codeSelectCustomStyles = (hasError: boolean) => ({
    control: (base: any, state: { isFocused: boolean }) => ({
      ...base,
      // 🌟 FIX 1: Standardized height for code select control
      height: '52px', 
      minHeight: '52px',
      border: 'none', 
      boxShadow: 'none',
      backgroundColor: 'transparent',
    }),
    valueContainer: (base: any) => ({
      ...base,
      padding: '0 4px', 
      paddingLeft: '12px', // 🌟 FIX 3: Increased padding to shift content (and divider) right
    }),
    singleValue: (base: any) => ({
      ...base,
      color: 'black',
      fontSize: '0.875rem', 
    }),
    indicatorSeparator: () => ({ display: 'none' }),
    dropdownIndicator: (base: any) => ({
      ...base,
      padding: '0 4px',
    }),
  });


  return (
    // FULL-PAGE MODAL CONTAINER
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-50 p-4 h-screen">
      {/* Main Modal Box: Added max-h-full to ensure it respects the parent's height */}
      <div className="relative w-full max-w-9xl rounded-xl bg-white shadow-2xl md:flex overflow-hidden my-auto animate-scale-fade h-full max-h-full min-h-[80vh]">
        
        {/* Left Side (Image/SVG) */}
        <div className="hidden md:flex md:w-1/2 flex-col justify-center items-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white p-10 relative h-200">
            <div className="relative z-10 text-center mt-20 h-90 ">
              <h1 className="text-4xl font-extrabold tracking-tight -mt-30">HR Management</h1>
                <p className="mt-4 text-lg opacity-90">Simplify HR tasks and keep your team productive.
                  All-in-one platform to manage employees, payroll, and performance.</p>
                <p></p>
                <AuthSvg />
              </div>
        </div>
          
        {/* Right Side (Form) */}
        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-start overflow-y-auto h-full max-h-full">
          <h2 className="text-4xl font-bold text-gray-700 mb-6 text-center flex-shrink-0">
            {showOtpVerification ? 'Verify Your Account' : 'Organization Register'}
          </h2>
          
          {loadingRegistration && (
            <div className="absolute inset-0 flex justify-center items-center bg-white/70 backdrop-blur-sm z-10">
              <Loader />
            </div>
          )}

          {!showOtpVerification ? (
            <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 flex-grow">
              
              {/* Org Name */}
              <div className="mb-2">
                <label className="mb-2 block text-sm font-medium text-gray-700 capitalize ">Organization name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="org_name"
                    placeholder="Organization name"
                    value={formik.values.org_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`${BASE_INPUT_CLASSES} ${formik.touched.org_name && formik.errors.org_name ? ERROR_CLASS : NORMAL_CLASS}`}
                  />
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                {formik.touched.org_name && formik.errors.org_name && (
                  <span className="mt-1 block text-sm text-red-500">{formik.errors.org_name}</span>
                )}
              </div>
              
              {/* Email */}
              {inputField('email', 'email', 'Enter your email', FaEnvelope)}
              
              {/* Password */}
              <div className="mb-2">
                <label className="mb-2 block text-sm font-medium text-gray-700 capitalize">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`${BASE_INPUT_CLASSES} ${formik.touched.password && formik.errors.password ? ERROR_CLASS : NORMAL_CLASS}`}
                  />
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
              
              {/* Organization Type Select */}
              <div className="mb-2">
                <label className="mb-2 block text-sm font-medium text-gray-700 capitalize">Organization Type</label>
                <div className="relative">
                  {loadingOrgTypes ? (
                    // 🌟 FIX 1: Standardized height for the loading text
                    <p className={`${BASE_INPUT_CLASSES} text-gray-500 !py-3 !pl-10 !pr-4 h-[52px]`}>Loading types...</p>
                  ) : errorOrgTypes ? (
                    // 🌟 FIX 1: Standardized height for the error text
                    <p className={`${BASE_INPUT_CLASSES} text-red-500 !py-3 !pl-10 !pr-4 border-red-500 h-[52px]`}>{errorOrgTypes}</p>
                  ) : (
                    <select
                      name="organization_type"
                      value={formik.values.organization_type}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      // 🌟 FIX 2: SELECT_BASE_CLASSES now hides native arrow
                      className={`${SELECT_BASE_CLASSES} ${formik.touched.organization_type && formik.errors.organization_type ? ERROR_CLASS : NORMAL_CLASS} !pl-10`}
                    >
                      <option value="">Select Organization Type</option>
                      {organizationTypes.map((type) => (
                        <option key={type.id} value={type.org_type}>
                          {type.org_type}
                        </option>
                      ))}
                    </select>
                  )}
                  <FaIndustry className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  {/* Custom Dropdown Icon */}
                  <FaCaretDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {formik.touched.organization_type && formik.errors.organization_type && (
                  <span className="mt-1 block text-sm text-red-500">{formik.errors.organization_type}</span>
                )}
              </div>

              {/* Website */}
              {inputField('website', 'text', 'Website URL', FaGlobe)}

              {/* GST Number */}
              {inputField('gst_number', 'text', 'GST Number', FaFileInvoice)}

              {/* Address */}
              {inputField('address', 'text', 'Address (Max 35 characters)', FaMapMarkerAlt)}

              {/* Country Select with React-Select (Custom Styling) */}
              <div className="mb-2 col-span-1">
                <label className="mb-2 block text-sm font-medium text-gray-700 capitalize">Country</label>
                <div className="relative">
                  <Select
                    name="country"
                    options={countries}
                    onChange={handleCountryChange}
                    onBlur={() => formik.setTouched({ ...formik.touched, country: true })}
                    value={countries.find(option => option.label === formik.values.country) || null}
                    placeholder="Select Country"
                    getOptionLabel={(option) => option.label}
                    getOptionValue={(option) => option.value}
                    formatOptionLabel={option => (
                      <div className="flex items-center text-gray-700">
                        <span className={`fi fi-${option.value.toLowerCase()} mr-2`}></span>
                        <span>{option.label}</span>
                      </div>
                    )}
                    classNamePrefix="react-select"
                    styles={selectCustomStyles(!!(formik.touched.country && formik.errors.country))}
                  />
                  <FaGlobeAmericas className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-30" />
                </div>
                {formik.touched.country && formik.errors.country && (
                  <span className="mt-1 block text-sm text-red-500">{formik.errors.country}</span>
                )}
              </div>

              {/* Combined Country Code & Phone Number Field */}
              <div className="mb-2">
                <label className="block text-sm font-medium mb-2 text-gray-700">Phone Number</label>
                <div className={`relative flex items-center rounded-lg border transition duration-300 ${formik.touched.phone_number && formik.errors.phone_number ? ERROR_CLASS : NORMAL_CLASS} focus-within:border-purple-600 focus-within:shadow-md h-[52px]`}>
                    
                    {/* Country Code Select: 🌟 FIX 3: Width adjusted to w-1/4 (more left shift) */}
                    <div className="w-1/4 border-r border-gray-300 h-full flex items-center">
                        <Select
                            name="country_code"
                            options={countryCodes}
                            onChange={handleCountryCodeChange}
                            onBlur={() => formik.setTouched({ ...formik.touched, country_code: true })}
                            value={countryCodes.find(option => option.value === formik.values.country_code) || null}
                            placeholder="Code"
                            getOptionLabel={(option) => option.label}
                            getOptionValue={(option) => option.value}
                            // 🌟 FIX 1: codeSelectCustomStyles now uses standardized height
                            styles={codeSelectCustomStyles(!!(formik.touched.country_code && formik.errors.country_code))}
                        />
                    </div>
                    
                    {/* Phone Number Input: 🌟 FIX 3: Width adjusted to w-3/4 (more space) */}
                    <div className="w-3/4 relative flex items-center">
                        <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            name="phone_number"
                            placeholder="10 digit number"
                            value={formik.values.phone_number}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            maxLength={10}
                            onInput={(e: any) => {
                                e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                                formik.setFieldValue('phone_number', e.target.value);
                            }}
                            // 🌟 FIX 1: Standardized padding/height for consistency
                            className="w-full h-full py-4 pl-10 pr-3 text-black outline-none border-none rounded-r-lg"
                        />
                    </div>
                </div>
                {formik.touched.phone_number && formik.errors.phone_number && (
                    <span className="mt-1 block text-sm text-red-500">{formik.errors.phone_number}</span>
                )}
                {formik.touched.country_code && formik.errors.country_code && (
                    <span className="mt-1 block text-sm text-red-500">{formik.errors.country_code}</span>
                )}
              </div>

              {/* State Select */}
              <div className="mb-2">
                <label className="block text-sm font-medium mb-2 text-gray-700">State</label>
                <div className="relative">
                  <select
                    name="state"
                    value={formik.values.state}
                    onChange={handleStateChange}
                    onBlur={formik.handleBlur}
                    disabled={states.length === 0}
                    // 🌟 FIX 2: SELECT_BASE_CLASSES now hides native arrow
                    className={`${SELECT_BASE_CLASSES} ${formik.touched.state && formik.errors.state ? ERROR_CLASS : NORMAL_CLASS} !pl-10`}
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state.isoCode} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  <FaMapMarkedAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  {/* Custom Dropdown Icon */}
                  <FaCaretDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {formik.touched.state && formik.errors.state && (
                  <span className="mt-1 block text-sm text-red-500">{formik.errors.state}</span>
                )}
              </div>

              {/* City Select */}
              <div className="mb-2">
                <label className="block text-sm font-medium mb-2 text-gray-700">City</label>
                <div className="relative">
                  <select
                    name="city"
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={cities.length === 0}
                    // 🌟 FIX 2: SELECT_BASE_CLASSES now hides native arrow
                    className={`${SELECT_BASE_CLASSES} ${formik.touched.city && formik.errors.city ? ERROR_CLASS : NORMAL_CLASS} !pl-10`}
                  >
                    <option value="">Select City</option>
                    {cities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  {/* Custom Dropdown Icon */}
                  <FaCaretDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {formik.touched.city && formik.errors.city && (
                  <span className="mt-1 block text-sm text-red-500">{formik.errors.city}</span>
                )}
              </div>

              {/* Description (TextArea) - spans both columns */}
              <div className="col-span-1 md:col-span-2">
                {inputField('description', 'text', 'Description (Max 100 characters)', FaInfoCircle, true)}
              </div>
              
              {/* BUTTONS */}
              <div className="flex flex-col gap-4 mt-2 col-span-1 md:col-span-2 flex-shrink-0">
                <Button
                  label={loadingRegistration ? 'Registering...' : 'Register'}
                  type="submit"
                  fullWidth
                  variant="primary"
                  loading={loadingRegistration}
                  className="w-full cursor-pointer rounded-lg border border-purple-600 bg-purple-600 py-4 text-white font-semibold transition hover:bg-purple-700 hover:border-purple-700" 
                />
                
                <Button
                  label="Cancel & Back to Sign In"
                  onClick={onRegisterSuccessAndRedirectToSignIn || onClose}
                  fullWidth
                  variant="secondary"
                  disabled={loadingRegistration}
                  className="w-full cursor-pointer rounded-lg border border-gray-400 bg-gray-500 py-4 text-white font-semibold transition hover:bg-gray-600 hover:border-gray-600"
                />
              </div>

              <div className="text-center col-span-1 md:col-span-2 mt-2 flex-shrink-0">
                <p className="text-sm text-gray-600">
                  Already have an account? 
                  <button type="button" onClick={onRegisterSuccessAndRedirectToSignIn || onClose} className="text-blue-500 hover:text-blue-700 ml-1 font-medium">Sign In</button>
                </p>
              </div>

            </form>
          ) : (
            <OtpVerificationForm
              email={registrationEmail}
              onVerificationSuccess={onRegisterSuccessAndRedirectToSignIn ?? (() => {})}
              onCancel={resetFormAndState} 
            />
          )}
        </div>
      </div>
    </div>
  );
}



