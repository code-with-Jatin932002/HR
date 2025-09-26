
// src/components/Loader.tsx
import React from 'react';

const Loader = () => {
    return (
        <div className="flex items-center justify-center"> 
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-purple-500 border-t-transparent"></div>
        </div>
    );
};

export default Loader;