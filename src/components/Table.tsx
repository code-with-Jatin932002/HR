
// // components/Table.tsx

// import React from 'react';

// interface TableColumn {
//   label: string;
//   key: string;
//   render?: (row: any) => React.ReactNode;
// }

// interface TableProps {
//   columns: TableColumn[];
//   data: any[]; // 'data' will be the pre-paginated and pre-filtered array for the current page
//   actions?: (row: any) => React.ReactNode;
// }

// const Table: React.FC<TableProps> = ({ columns, data, actions }) => {
//   // Removed: searchTerm state and related handlers (handleSearchChange, clearSearch)
//   // Removed: filteredData calculation, as data is now received already filtered from the parent.

//   return (
//     <div className="bg-white rounded-lg shadow-md overflow-x-auto w-full">

//       {/* 🔍 Search Box - REMOVED from here. It will now be handled by the parent component. */}
//       {/*
//       <div className="w-full px-4 py-3">
//         <div className="relative w-full">
//           <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
//             <FiSearch />
//           </span>
//           <input
//             type="text"
//             placeholder="Search..."
//             value={searchTerm}
//             onChange={handleSearchChange}
//             className="w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
//           />
//           {searchTerm && (
//             <button
//               onClick={clearSearch}
//               className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500"
//             >
//               <FiX />
//             </button>
//           )}
//         </div>
//       </div>
//       */}

//       {/* 🧾 Table */}
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
//           {data.length > 0 ? ( // Use 'data' directly instead of 'filteredData'
//             data.reverse().map((row, index) => ( // Apply reverse here if you want latest first for the current page
//               <tr key={row.id || index} className="border-b hover:bg-gray-50">
//                 <td className="px-6 py-4">{index + 1}</td>
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
//                 colSpan={columns.length + (actions ? 2 : 1)} // Adjusted for S.No column
//                 className="text-center py-4 text-gray-500"
//               >
//                 No data found.
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>

//       {/* 📄 Pagination - REMOVED from here. It is handled by the parent component. */}
//     </div>
//   );
// };

// export default Table;



// components/Table.tsx

import React from 'react';

interface TableColumn {
  label: string;
  key: string;
  render?: (row: any) => React.ReactNode;
}

interface TableProps {
  columns: TableColumn[];
  data: any[]; // 'data' will be the pre-paginated and pre-filtered array for the current page
  actions?: (row: any) => React.ReactNode;
  currentPage: number; // ADDED: Current page number from parent
  itemsPerPage: number; // ADDED: Number of items per page from parent
}

const Table: React.FC<TableProps> = ({ columns, data, actions, currentPage, itemsPerPage }) => {
  // Removed: searchTerm state and related handlers (handleSearchChange, clearSearch)
  // Removed: filteredData calculation, as data is now received already filtered from the parent.

  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto w-full">

      {/* 🔍 Search Box - REMOVED from here. It will now be handled by the parent component. */}
      {/*
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
      */}

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
          {data.length > 0 ? ( // Use 'data' directly instead of 'filteredData'
            data.reverse().map((row, index) => ( // Apply reverse here if you want latest first for the current page
              <tr key={row.id || index} className="border-b hover:bg-gray-50">
                {/* UPDATED: Serial Number Calculation */}
                <td className="px-6 py-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
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
                colSpan={columns.length + (actions ? 2 : 1)} // Adjusted for S.No column
                className="text-center py-4 text-gray-500"
              >
                No data found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 📄 Pagination - REMOVED from here. It is handled by the parent component. */}
    </div>
  );
};

export default Table;