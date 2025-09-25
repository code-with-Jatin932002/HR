// ActionButton.tsx
'use client';

import React from 'react';
import { FaEye, FaEdit, FaTrash, FaCheckCircle, FaSpinner } from 'react-icons/fa'; // Import FaSpinner

interface ActionButtonsProps {
    onView?: () => void;
    onUpdate?: () => void;
    onDelete?: () => void;
    onStatusUpdate?: () => void;
    showView?: boolean;
    showUpdate?: boolean;
    showDelete?: boolean;
    showStatusUpdate?: boolean;
    isDeleting?: boolean; // Add this line
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
    onView,
    onUpdate,
    onDelete,
    onStatusUpdate,
    showView = true,
    showUpdate = true,
    showDelete = true,
    showStatusUpdate = false,
    isDeleting = false, // Add this line with a default value
}) => {
    // DEBUG LOG: Log the props received by ActionButtons
    console.log('ActionButtons: Props received:', { showView, showUpdate, showDelete, showStatusUpdate, onStatusUpdate: !!onStatusUpdate, isDeleting });

    // Common button classes for consistency with Figma (transparent background, subtle hover, larger size)
    // Increased padding (p-2.5) and icon size (text-lg) for a bigger look
    const commonButtonClasses = "relative p-2.5 rounded text-lg group cursor-pointer bg-transparent hover:bg-gray-100 text-gray-600 flex items-center justify-center";
    const disabledButtonClasses = "opacity-50 cursor-not-allowed"; // Added for disabled state

    return (
        <div className="flex space-x-0"> {/* Increased space-x for more separation */}
            {showView && (
                <button
                    onClick={onView}
                    className={commonButtonClasses}
                    title="View"
                >
                    <FaEye />
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden  bg-blue text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                        View
                    </span>
                </button>
            )}
            {showUpdate && (
                <button
                    onClick={onUpdate}
                    className={commonButtonClasses}
                    title="Update"
                >
                    <FaEdit />
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-green text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                        Update
                    </span>
                </button>
            )}
            {showDelete && (
                <button
                    onClick={onDelete}
                    className={`${commonButtonClasses} ${isDeleting ? disabledButtonClasses : ''}`} // Apply disabled class
                    title={isDeleting ? "Deleting..." : "Delete"} // Change title when deleting
                    disabled={isDeleting} // Disable the button when deleting
                >
                    {isDeleting ? <FaSpinner className="animate-spin" /> : <FaTrash />} {/* Show spinner if deleting */}
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                        {isDeleting ? "Deleting..." : "Delete"}
                    </span>
                </button>
            )}
            {/* New Status Update Button - applying the same unified transparent, larger style */}
            {showStatusUpdate && onStatusUpdate && (
                <button
                    onClick={onStatusUpdate}
                    className={commonButtonClasses}
                    title="Update Status"
                >
                    <FaCheckCircle />
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 z-10 whitespace-nowrap">
                        Status
                    </span>
                </button>
            )}
        </div>
    );
};

export default ActionButtons;