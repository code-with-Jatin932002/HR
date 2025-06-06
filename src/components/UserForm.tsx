
// 'use client';
// import { useFormik } from 'formik';
// import * as Yup from 'yup';
// import { useMemo } from 'react';

// interface FormValues {
//   first_name: string;
//   last_name: string;
//   email: string;
//   password: string;
//   role_type: string;
// }

// interface UserFormProps {
//   isUpdate: boolean;
//   initialValues: FormValues;
//   onCancel: () => void;
//   onSubmit: (values: FormValues) => void;
// }

// export default function UserForm({ isUpdate, initialValues, onCancel, onSubmit }: UserFormProps) {

    
//   const validationSchema = useMemo(() => {
//     return Yup.object({
//       first_name: Yup.string().required('First name is required'),
//       last_name: Yup.string().required('Last name is required'),
//       email: Yup.string().email('Invalid email').required('Email is required'),
//       password: isUpdate
//         ? Yup.string()
//         : Yup.string().required('Password is required').min(6),
//       role_type: Yup.string().required('Role type is required'),
//     });
//   }, [isUpdate]);

//   const formik = useFormik<FormValues>({
//     initialValues,
//     validationSchema,
//     enableReinitialize: true,
//     onSubmit,
//   });

//   return (
//     <form onSubmit={formik.handleSubmit} className="space-y-4">
//       <div className="grid grid-cols-2 gap-4">
//         <div>
//           <label className="block mb-1">First Name</label>
//           <input
//             type="text"
//             name="first_name"
//             value={formik.values.first_name || ''}
//             onChange={formik.handleChange}
//             onBlur={formik.handleBlur}
//             className="w-full border px-3 py-2 rounded"
//           />
//           {formik.touched.first_name && formik.errors.first_name && (
//             <span className="text-sm text-red-500">{formik.errors.first_name}</span>
//           )}
//         </div>

//         <div>
//           <label className="block mb-1">Last Name</label>
//           <input
//             type="text"
//             name="last_name"
//             value={formik.values.last_name || ''}
//             onChange={formik.handleChange}
//             onBlur={formik.handleBlur}
//             className="w-full border px-3 py-2 rounded"
//           />
//           {formik.touched.last_name && formik.errors.last_name && (
//             <span className="text-sm text-red-500">{formik.errors.last_name}</span>
//           )}
//         </div>

//         <div>
//           <label className="block mb-1">Email</label>
//           <input
//             type="email"
//             name="email"
//             value={formik.values.email}
//             onChange={formik.handleChange}
//             onBlur={formik.handleBlur}
//             className="w-full border px-3 py-2 rounded"
//           />
//           {formik.touched.email && formik.errors.email && (
//             <span className="text-sm text-red-500">{formik.errors.email}</span>
//           )}
//         </div>

//         {!isUpdate && (
//           <div>
//             <label className="block mb-1">Password</label>
//             <input
//               type="password"
//               name="password"
//               value={formik.values.password}
//               onChange={formik.handleChange}
//               onBlur={formik.handleBlur}
//               className="w-full border px-3 py-2 rounded"
//             />
//             {formik.touched.password && formik.errors.password && (
//               <span className="text-sm text-red-500">{formik.errors.password}</span>
//             )}
//           </div>
//         )}

//         <div className="col-span-2">
//           <label className="block mb-1">Role Type</label>
//           <select
//             name="role_type"
//             value={formik.values.role_type}
//             onChange={formik.handleChange}
//             onBlur={formik.handleBlur}
//             className="w-full border px-3 py-2 rounded"
//           >
//             <option value="Admin">Admin</option>
//             <option value="HR">HR</option>
//             <option value="Employee">Employee</option>
//           </select>
//           {formik.touched.role_type && formik.errors.role_type && (
//             <span className="text-sm text-red-500">{formik.errors.role_type}</span>
//           )}
//         </div>
//       </div>

//       <div className="flex justify-between">
//         <button
//           type="button"
//           onClick={onCancel}
//           className="bg-gray-300 px-4 py-2 rounded"
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           {isUpdate ? 'Update User' : 'Create User'}
//         </button>
//       </div>
//     </form>
//   );
// }






'use client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMemo } from 'react';

interface FormValues {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role_type: string;
   department_name: string;
}

interface UserFormProps {
  isUpdate: boolean;
  initialValues: FormValues;
  onCancel: () => void;
  onSubmit: (values: FormValues) => void;
}

export default function UserForm({ isUpdate, initialValues, onCancel, onSubmit }: UserFormProps) {

    
  const validationSchema = useMemo(() => {
    return Yup.object({
      first_name: Yup.string().required('First name is required'),
      last_name: Yup.string().required('Last name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: isUpdate
        ? Yup.string()
        : Yup.string().required('Password is required').min(6),
      role_type: Yup.string().required('Role type is required'),
       department_name: Yup.string().required('Department name is required'),
    });
  }, [isUpdate]);

  const formik = useFormik<FormValues>({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit,
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">First Name</label>
          <input
            type="text"
            name="first_name"
            value={formik.values.first_name || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border px-3 py-2 rounded"
          />
          {formik.touched.first_name && formik.errors.first_name && (
            <span className="text-sm text-red-500">{formik.errors.first_name}</span>
          )}
        </div>

        <div>
          <label className="block mb-1">Last Name</label>
          <input
            type="text"
            name="last_name"
            value={formik.values.last_name || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border px-3 py-2 rounded"
          />
          {formik.touched.last_name && formik.errors.last_name && (
            <span className="text-sm text-red-500">{formik.errors.last_name}</span>
          )}
        </div>

        <div>
          <label className="block mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border px-3 py-2 rounded"
          />
          {formik.touched.email && formik.errors.email && (
            <span className="text-sm text-red-500">{formik.errors.email}</span>
          )}
        </div>

        {!isUpdate && (
          <div>
            <label className="block mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full border px-3 py-2 rounded"
            />
            {formik.touched.password && formik.errors.password && (
              <span className="text-sm text-red-500">{formik.errors.password}</span>
            )}
          </div>
        )}

        <div className="col-span-2">
          <label className="block mb-1">Role Type</label>
          <select
            name="role_type"
            value={formik.values.role_type}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="Admin">Admin</option>
            <option value="HR">HR</option>
            <option value="Employee">Employee</option>
          </select>
          {formik.touched.role_type && formik.errors.role_type && (
            <span className="text-sm text-red-500">{formik.errors.role_type}</span>
          )}
        </div>

        <div className="col-span-2">
  <label className="block mb-1">Department Name</label>
  <input
    type="text"
    name="department_name"
    value={formik.values.department_name}
    onChange={formik.handleChange}
    onBlur={formik.handleBlur}
    className="w-full border px-3 py-2 rounded"
  />
  {formik.touched.department_name && formik.errors.department_name && (
    <span className="text-sm text-red-500">{formik.errors.department_name}</span>
  )}
</div>


      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isUpdate ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  );
}

