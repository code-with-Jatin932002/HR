
// 'use client';

// import React from 'react';
// import { FaEye, FaEdit, FaTrash } from 'react-icons/fa'; // FontAwesome icons

// interface ActionButtonsProps {
//   onView?: () => void;
//   onUpdate?: () => void;
//   onDelete?: () => void;
//   showView?: boolean;
//   showUpdate?: boolean;
//   showDelete?: boolean;
// }

// const ActionButtons: React.FC<ActionButtonsProps> = ({
//   onView,
//   onUpdate,
//   onDelete,
//   showView = true,
//   showUpdate = true,
//   showDelete = true,
// }) => {
//   return (
//     <div className="flex space-x-2">
//       {showView && (
//         <button
//           onClick={onView}
//           className="relative bg-gray-200 p-2 rounded hover:bg-gray-300 text-sm group cursor-pointer"
//         >
//           <FaEye />
//           <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 z-10">
//             View
//           </span>
//         </button>
//       )}
//       {showUpdate && (
//         <button
//           onClick={onUpdate}
//           className="relative bg-yellow-400 p-2 rounded hover:bg-yellow-500 text-white text-sm group cursor-pointer"
//         >
//           <FaEdit />
//           <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 z-10">
//             Update
//           </span>
//         </button>
//       )}
//       {showDelete && (
//         <button
//           onClick={onDelete}
//           className="relative bg-red-600 p-2 rounded hover:bg-red-700 text-white text-sm group cursor-pointer"
//         >
//           <FaTrash />
//           <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 z-10 ">
//             Delete
//           </span>
//         </button>
//       )}
//     </div>
//   );
// };

// export default ActionButtons;


'use client';

import React from 'react';
// Import FaCheckCircle for the new status update button
import { FaEye, FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';

interface ActionButtonsProps {
    onView?: () => void;
    onUpdate?: () => void;
    onDelete?: () => void;
    onStatusUpdate?: () => void; // New prop for status update action
    showView?: boolean;
    showUpdate?: boolean;
    showDelete?: boolean;
    showStatusUpdate?: boolean; // New prop to control visibility of status update button
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
    onView,
    onUpdate,
    onDelete,
    onStatusUpdate, // Destructure the new prop
    showView = true,
    showUpdate = true,
    showDelete = true,
    showStatusUpdate = false, // Default to false, as it's role-specific
}) => {
    // DEBUG LOG: Log the props received by ActionButtons
    console.log('ActionButtons: Props received:', { showView, showUpdate, showDelete, showStatusUpdate, onStatusUpdate: !!onStatusUpdate });

    return (
        <div className="flex space-x-2">
            {showView && (
                <button
                    onClick={onView}
                    className="relative bg-gray-200 p-2 rounded hover:bg-gray-300 text-sm group cursor-pointer"
                    title="View" // Add title for accessibility and hover text consistency
                >
                    <FaEye />
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 z-10">
                        View
                    </span>
                </button>
            )}
            {showUpdate && (
                <button
                    onClick={onUpdate}
                    className="relative bg-yellow-400 p-2 rounded hover:bg-yellow-500 text-white text-sm group cursor-pointer"
                    title="Update"
                >
                    <FaEdit />
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 z-10">
                        Update
                    </span>
                </button>
            )}
            {showDelete && (
                <button
                    onClick={onDelete}
                    className="relative bg-red-600 p-2 rounded hover:bg-red-700 text-white text-sm group cursor-pointer"
                    title="Delete"
                >
                    <FaTrash />
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 z-10 ">
                        Delete
                    </span>
                </button>
            )}
            {/* New Status Update Button */}
            {showStatusUpdate && onStatusUpdate && ( // Check both boolean flag and function existence
                <button
                    onClick={onStatusUpdate}
                    className="relative bg-blue-500 p-2 rounded hover:bg-blue-600 text-white text-sm group cursor-pointer"
                    title="Update Status" // Add title for this button
                >
                    <FaCheckCircle /> {/* Icon for status update */}
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 z-10">
                        Status
                    </span>
                </button>
            )}
        </div>
    );
};

export default ActionButtons;