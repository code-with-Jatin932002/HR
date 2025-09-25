import React from 'react';

interface PaginationProps {
 currentPage: number;
 totalPages: number;
 onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
if (totalPages <= 1) return null;

const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

return (
   <div className="flex justify-end">
 <nav className="flex items-center gap-1 text-sm">
<button
onClick={() => onPageChange(currentPage - 1)}
 disabled={currentPage === 1}
 className="px-2 py-0.5 rounded border text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 Prev
</button>

 {pages.map((page) => (
 <button
key={page}
 onClick={() => onPageChange(page)}
 className={`px-2 py-0.5 rounded border ${
currentPage === page
 ? 'bg-purple-600 text-white'
 : 'bg-white text-gray-700 hover:bg-gray-100'
 }`}
 >
 {page}
 </button>
 ))}

<button
 onClick={() => onPageChange(currentPage + 1)}
 disabled={currentPage === totalPages}
 className="px-2 py-0.5 rounded border text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
 >
 Next
 </button>
 </nav>
</div> );
};

export default Pagination;
