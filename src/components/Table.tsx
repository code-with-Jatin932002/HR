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
  currentPage: number; // Current page number from parent
  itemsPerPage: number; // Number of items per page from parent
}

const Table: React.FC<TableProps> = ({ columns, data, actions, currentPage, itemsPerPage }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 antialiased">
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-50 uppercase text-xs text-gray-900 tracking-wider">
            <tr>{ /* THIS LINE: Ensure no newline/space after <tr> and before the first <th> */ }
              <th scope="col" className="px-6 py-3 font-medium">S. No</th>
              {columns.map((col, index) => (
                <th key={col.key} scope="col" className={`px-6 py-3 font-medium`}>
                  {col.label}
                </th>
              ))}{ /* THIS LINE: Ensure no newline/space after the last </th> and before the next element or closing </tr> */ }
              {actions && <th scope="col" className="px-6 py-3 font-medium">Actions</th>}
            </tr>{ /* THIS LINE: Ensure no newline/space before </tr> */ }
          </thead>
          <tbody className="divide-y divide-gray-200">{
            data.length > 0 ? (
              data.map((row, index) => (
                <tr key={row.id || index} className="hover:bg-purple-50 transition duration-150 ease-in-out">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-4 whitespace-nowrap">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                  {actions && <td className="px-6 py-4 whitespace-nowrap">{actions(row)}</td>}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 2 : 1)}
                  className="text-center py-8 text-gray-500 italic"
                >
                  No data found.
                </td>
              </tr>
            )
          }</tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;