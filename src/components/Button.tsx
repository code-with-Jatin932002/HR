// import React from 'react';

// interface ButtonProps {
//   label: string;
//   onClick?: () => void;
//   type?: 'button' | 'submit' | 'reset';
//   className?: string;
//   disabled?: boolean;
// }

// const Button: React.FC<ButtonProps> = ({
//   label,
//   onClick,
//   type = 'button',
//   className = '',
//   disabled = false,
// }) => {
//   return (
//     <button
//       type={type}
//       onClick={onClick}
//       className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 ${className}`}
//       disabled={disabled}
//     >
//       {label}
//     </button>
//   );
// };

// export default Button;




// components/common/Button.tsx
import React from 'react';
import { FaSpinner } from 'react-icons/fa';

interface ButtonProps {
  label?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'white' | 'success' | 'text' | 'dropdown';
  loading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
  icon,
  fullWidth = false,
  variant = 'primary',
  loading = false,
}) => {
  // const baseClasses = 'px-4 py-2 rounded transition flex items-center justify-center gap-2 cursor-pointer';
  const baseClasses =
  'px-4 py-2 rounded-md shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center gap-2 cursor-pointer';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    white: 'bg-white text-blue-600 hover:bg-blue-100 focus:ring-blue-500',
    text: 'bg-transparent text-blue-600 hover:text-blue-800',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
      dropdown: 'w-full text-left text-gray-800 hover:bg-gray-100 px-4 py-2 flex items-center gap-2',

  };


  const combinedClasses = `${baseClasses} ${
    variantClasses[variant]
  } ${fullWidth ? 'w-full' : 'w-auto'} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      className={combinedClasses}
      disabled={disabled || loading}
    >
      {loading && <FaSpinner className="animate-spin" />}
      {!loading && icon}
      {label}
    </button>
  );
};

export default Button;

