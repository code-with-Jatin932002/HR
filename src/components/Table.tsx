
// import React, { useState } from 'react';

// interface TableColumn {
//   label: string;
//   key: string;
//   render?: (row: any) => React.ReactNode;
// }

// interface TableProps {
//   columns: TableColumn[];
//   data: any[];
//   actions?: (row: any) => React.ReactNode;
//   itemsPerPage?: number;
// }

// const Table: React.FC<TableProps> = ({ columns, data, actions, itemsPerPage = 10 }) => {
//   const [currentPage, setCurrentPage] = useState(1);

//   const totalPages = Math.ceil(data.length / itemsPerPage);

//   const handlePageChange = (page: number) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page);
//     }
//   };

//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const currentData = data.slice(startIndex, startIndex + itemsPerPage);

//   return (
//     <div className="bg-white rounded-lg shadow-md overflow-x-auto">
//       <table className="min-w-full text-sm text-left text-gray-900">
//         <thead className="bg-blue-100 text-blue-700 uppercase text-xs">
//           <tr>
//             <th className="px-6 py-4">S. No</th>
//             {columns.map((col) => (
//               <th key={col.key} className="px-6 py-4">{col.label}</th>
//             ))}
//             {actions && <th className="px-6 py-4">Actions</th>}
//           </tr>
//         </thead>
//         <tbody>
//           {currentData.length > 0 ? (
//             currentData.map((row, index) => (
//               <tr key={index} className="border-b hover:bg-gray-50">
//                 <td className="px-6 py-4">{startIndex + index + 1}</td>
//                 {columns.map((col) => (
//                   <td key={col.key} className="px-6 py-4">
//                     {col.render ? col.render(row) : row[col.key]}
//                   </td>
//                 ))}
//                 {actions && <td className="px-6 py-4">{actions(row)}</td>}
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td
//                 colSpan={columns.length + (actions ? 2 : 1)}
//                 className="text-center py-4 text-gray-500"
//               >
//                 No data found.
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-4 gap-2">
//           <div className="text-sm text-gray-600">
//             {startIndex + 1} - {Math.min(startIndex + itemsPerPage, data.length)} of {data.length}
//           </div>

//           <div className="flex space-x-1">
//             <button
//               onClick={() => handlePageChange(currentPage - 1)}
//               disabled={currentPage === 1}
//               className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
//             >
//               &lt;
//             </button>

//             {[...Array(totalPages)].map((_, idx) => {
//               const pageNum = idx + 1;
//               return (
//                 <button
//                   key={pageNum}
//                   onClick={() => handlePageChange(pageNum)}
//                   className={`px-3 py-1 border rounded cursor-pointer hover:bg-blue-100 ${
//                     currentPage === pageNum
//                       ? 'bg-blue-600 text-white font-semibold'
//                       : 'bg-white text-gray-800'
//                   }`}
//                 >
//                   {pageNum}
//                 </button>
//               );
//             })}

//             <button
//               onClick={() => handlePageChange(currentPage + 1)}
//               disabled={currentPage === totalPages}
//               className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
//             >
//               &gt;
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Table;




import React, { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi'; // Icons

interface TableColumn {
  label: string;
  key: string;
  render?: (row: any) => React.ReactNode;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  actions?: (row: any) => React.ReactNode;
  itemsPerPage?: number;
}

const Table: React.FC<TableProps> = ({ columns, data, actions, itemsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const filteredData = data
    .filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .reverse();

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto w-full">

      {/* 🔍 Search Box */}
      <div className="w-full px-4 py-3">
        <div className="relative w-full">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            <FiSearch />
          </span>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500"
            >
              <FiX />
            </button>
          )}
        </div>
      </div>

      {/* 🧾 Table */}
      <table className="min-w-full text-sm text-left text-gray-900">
        <thead className="bg-blue-100 text-blue-700 uppercase text-xs">
          <tr>
            <th className="px-6 py-4">S. No</th>
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-4">{col.label}</th>
            ))}
            {actions && <th className="px-6 py-4">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((row, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{startIndex + index + 1}</td>
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
                {actions && <td className="px-6 py-4">{actions(row)}</td>}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + (actions ? 2 : 1)}
                className="text-center py-4 text-gray-500"
              >
                No data found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 📄 Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-4 gap-2">
          <div className="text-sm text-gray-600">
            {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length}
          </div>

          <div className="flex space-x-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
            >
              &lt;
            </button>

            {[...Array(totalPages)].map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-1 border rounded cursor-pointer hover:bg-blue-100 ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-white text-gray-800'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table; 

