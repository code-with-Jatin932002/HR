// 'use client';
// import callApi from '@/utils/callApi';
// import { useState } from 'react';
// import { FaEnvelope, FaLock, FaUser, FaUserTag, FaEye, FaEyeSlash } from 'react-icons/fa';
// import { useFormik } from 'formik';
// import * as Yup from 'yup';

// interface Props {
//   onClose: () => void;
// }

// export default function RegisterModal({ onClose }: Props) {
//   const [success, setSuccess] = useState(false);
//   const [message, setMessage] = useState('');
//   const [showPassword, setShowPassword] = useState(false);

//   const formik = useFormik({
//     initialValues: {
//       first_name: '',
//       last_name: '',
//       email: '',
//       password: '',
//       role_type: 'super_admin',
//     },
//     validationSchema: Yup.object({
//       first_name: Yup.string().required('First name is required'),
//       last_name: Yup.string().required('Last name is required'),
//       email: Yup.string().email('Invalid email address').required('Email is required'),
//       password: Yup.string()
//         .min(6, 'Password must be at least 6 characters')
//         .required('Password is required'),
//       // role_type: Yup.string().required('Role type is required'),
//         // role_type: Yup.string().required('Please select a role type'),
//         role_type: Yup.string()
//     .required('Please select a role type')
//     .notOneOf([''], 'Please select a role type'),

//     }),
    

//     onSubmit: async (values, { resetForm }) => {
//   try {
//     const data = await callApi(
//       'post',
//       'http://127.0.0.1:5000/register',
//       values,
//       {
//         'Content-Type': 'application/json',
//       }
//     );

//     if (!data.detail) {
//       setMessage('✅ Organization registered (super-admin)');
//       setSuccess(true);
//       resetForm();
//       setTimeout(() => {
//         onClose();
//       }, 1500);
//     } else {
//       let errorMsg = 'Registration failed';
//       if (Array.isArray(data.detail)) {
//         errorMsg = data.detail.map((d: any) => d.msg).join(', ');
//       } else if (typeof data.detail === 'string') {
//         errorMsg = data.detail;
//       }
//       setMessage(errorMsg);
//     }
//   } catch (error: any) {
//     let errorMsg = 'An error occurred during registration';
//     if (error?.response?.data?.detail) {
//       if (Array.isArray(error.response.data.detail)) {
//         errorMsg = error.response.data.detail.map((d: any) => d.msg).join(', ');
//       } else {
//         errorMsg = error.response.data.detail;
//       }
//     }
//     setMessage(errorMsg);
//   }
// }



//   });

//   return (
//     // <div className="fixed top-0 left-0 w-full h-full z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center">
//     <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto py-10 px-4 flex justify-center items-start">

//       <div className="bg-white w-full max-w-2xl rounded-lg overflow-hidden shadow-lg flex flex-col md:flex-row">
//         {/* Left Side */}
//         <div className="hidden md:flex md:w-1/2 bg-blue-100 p-6 items-center justify-center">
//           <p className="text-gray-600 text-center px-4">
//             Welcome! Please register to continue.
//           </p>
//         </div>

//         {/* Right Side - Form */}
//         <div className="w-full md:w-1/2 p-6 md:p-10">
//           <h2 className="text-2xl font-bold text-black mb-6 text-center">Register</h2>

//           <form onSubmit={formik.handleSubmit}>
//             {/* First Name */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-2">First Name</label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   name="first_name"
//                   placeholder="Enter your first name"
//                   value={formik.values.first_name}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   className="w-full border rounded-lg py-3 px-4 pl-10 text-black outline-none focus:border-blue-500"
//                 />
//                 <FaUser className="absolute left-3 top-4 text-gray-500" />
//               </div>
//               {formik.touched.first_name && formik.errors.first_name && (
//                 <span className="text-sm text-red-500 mt-1 block">{formik.errors.first_name}</span>
//               )}
//             </div>

//             {/* Last Name */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-2">Last Name</label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   name="last_name"
//                   placeholder="Enter your last name"
//                   value={formik.values.last_name}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   className="w-full border rounded-lg py-3 px-4 pl-10 text-black outline-none focus:border-blue-500"
//                 />
//                 <FaUser className="absolute left-3 top-4 text-gray-500" />
//               </div>
//               {formik.touched.last_name && formik.errors.last_name && (
//                 <span className="text-sm text-red-500 mt-1 block">{formik.errors.last_name}</span>
//               )}
//             </div>

//             {/* Email */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-2">Email</label>
//               <div className="relative">
//                 <input
//                   type="email"
//                   name="email"
//                   placeholder="Enter your email"
//                   value={formik.values.email}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   className="w-full border rounded-lg py-3 px-4 pl-10 text-black outline-none focus:border-blue-500"
//                 />
//                 <FaEnvelope className="absolute left-3 top-4 text-gray-500" />
//               </div>
//               {formik.touched.email && formik.errors.email && (
//                 <span className="text-sm text-red-500 mt-1 block">{formik.errors.email}</span>
//               )}
//             </div>

//             {/* Password */}
//             <div className="mb-4">
//               <label className="block text-sm font-medium mb-2">Password</label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   name="password"
//                   placeholder="Enter your password"
//                   value={formik.values.password}
//                   onChange={formik.handleChange}
//                   onBlur={formik.handleBlur}
//                   className="w-full border rounded-lg py-3 px-4 pl-10 pr-10 text-black outline-none focus:border-blue-500"
//                 />
//                 <FaLock className="absolute left-3 top-4 text-gray-500" />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-4.5 text-gray-500 hover:text-gray-700"
//                 >
//                   {showPassword ? <FaEyeSlash /> : <FaEye />}
//                 </button>
//               </div>
//               {formik.touched.password && formik.errors.password && (
//                 <span className="text-sm text-red-500 mt-1 block">{formik.errors.password}</span>
//               )}
//             </div>

//             {/* Role Type */}
//           <div className="mb-6">
//   <label className="block text-sm font-medium mb-2">Role Type</label>
//   <div className="relative">
//     <select
//       name="role_type"
//       value={formik.values.role_type}
//       onChange={formik.handleChange}
//       onBlur={formik.handleBlur}
//       className={`w-full border rounded-lg py-3 px-4 pl-10 text-black outline-none ${
//         formik.touched.role_type && formik.errors.role_type
//           ? 'border-red-500'
//           : 'focus:border-blue-500'
//       }`}
//     >
//       {/* <option value="">Select Role Type</option> Default placeholder */}
//   <option value="" disabled >Select Role Type</option>
//       <option value="super_admin">Super Admin</option>
//       {/* <option value="admin">Admin</option>
//       <option value="employee">Employee</option> */}
//     </select>
//     <FaUserTag className="absolute left-3 top-3.5 text-gray-500" />
//   </div>
//   {formik.touched.role_type && formik.errors.role_type && (
//     <span className="text-sm text-red-500 mt-1 block">{formik.errors.role_type}</span>
//   )}
// </div>

//             {/* Submit Button */}
//             <button
//               type="submit"
//               className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 cursor-pointer transition font-semibold"
//             >
//               Register
//             </button>

//             {/* Success / Error Message */}
//             {message && (
//               <p className={`mt-4 text-center ${success ? 'text-green-600' : 'text-red-600'}`}>
//                 {message}
//               </p>
//             )}

//             {/* Close Button */}
//             <button
//               type="button"
//               className="w-full mt-4 text-blue-600 hover:text-blue-800 cursor-pointer font-semibold"
//               onClick={onClose}
//             >
//               Cancel
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }








'use client';
import { useState } from 'react';
import { useFormik, getIn } from 'formik';
import * as Yup from 'yup';
import callApi from '@/utils/callApi';
import Swal from 'sweetalert2';
import {
  FaEnvelope, FaLock, FaUser, FaUserTag, FaPhone,
  FaIndustry, FaMapMarkerAlt, FaInfoCircle, FaGlobe, FaFileInvoice, FaEyeSlash, FaEye
} from 'react-icons/fa';

interface Props {
  onClose: () => void;
}

export default function RegisterModal({ onClose }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      org_name: '',
      email: '',
      password: '',
      role_type: 'super_Admin',
      address: '',
      phone_number: '',
      industry: '',
      description: '',
      website: '',
      gst_number: '',
    },
    validationSchema: Yup.object({
      org_name: Yup.string().required('Organization name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: Yup.string().min(6, 'Min 6 characters').required('Password is required'),
      role_type: Yup.string().required('Role type is required'),
      address: Yup.string().required('Address is required'),
      phone_number: Yup.string().required('Phone number is required'),
      industry: Yup.string().required('Industry is required'),
      description: Yup.string().required('Description is required'),
      website: Yup.string().required('Website is required'),
      gst_number: Yup.string().required('GST Number is required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await callApi('post', 'http://127.0.0.1:5000/organization', values, {
          'Content-Type': 'application/json',
        });

        if (!response.detail) {
          Swal.fire('Success ✅', 'Organization registered successfully!', 'success');
          resetForm();
          onClose();
        } else {
          Swal.fire('Error ❌', response.detail, 'error');
        }
      } catch (err: any) {
        Swal.fire('Error ❌', err?.response?.data?.detail || 'Registration failed', 'error');
      }
    },
  });

  const inputField = (
    name: string,
    type: string,
    placeholder: string,
    Icon: any
  ) => {
    const value = getIn(formik.values, name);
    const error = getIn(formik.errors, name);
    const touched = getIn(formik.touched, name);

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 capitalize">{name.replace('_', ' ')}</label>
        <div className="relative">
          <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border rounded-lg py-3 px-4 pl-10 text-black outline-none focus:border-blue-500"
          />
          <Icon className="absolute left-3 top-4 text-gray-500" />
        </div>
        {touched && error && (
          <span className="text-sm text-red-500">{error}</span>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm overflow-y-auto py-10 px-4 flex justify-center items-start">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg flex flex-col md:flex-row overflow-hidden">
        {/* Left */}
        <div className="hidden md:flex md:w-1/2 bg-blue-100 p-6 items-center justify-center">
          <p className="text-gray-600 text-center">Register your organization as a Super Admin</p>
        </div>

        {/* Right */}
        <div className="w-full md:w-1/2 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-black mb-4 text-center">Organization Register</h2>
          <form onSubmit={formik.handleSubmit}>

            {inputField('org_name', 'text', 'Organization name', FaUser)}
            {inputField('email', 'email', 'Email', FaEnvelope)}

            {/* Password with Toggle */}
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
                  {/* {showPassword ? '🙈' : '👁️'} */}
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <span className="text-sm text-red-500">{formik.errors.password}</span>
              )}
            </div>

            {/* Other Inputs */}
            {inputField('address', 'text', 'Address', FaMapMarkerAlt)}
            {inputField('phone_number', 'text', 'Phone Number', FaPhone)}
            {inputField('industry', 'text', 'Industry', FaIndustry)}
            {inputField('description', 'text', 'Description', FaInfoCircle)}
            {inputField('website', 'text', 'Website', FaGlobe)}
            {inputField('gst_number', 'text', 'GST Number', FaFileInvoice)}

            {/* Role Type Fixed */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Role Type</label>
              <div className="relative">
                <select
                  name="role_type"
                  value={formik.values.role_type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full border rounded-lg py-3 px-4 pl-10 text-black outline-none focus:border-blue-500"
                  disabled
                >
                  <option value="super_Admin">Super Admin</option>
                </select>
                <FaUserTag className="absolute left-3 top-3.5 text-gray-500" />
              </div>
            </div>

            {/* Buttons */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Register Organization
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full mt-4 text-blue-600 hover:text-blue-800 font-semibold"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}







