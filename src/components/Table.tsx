
// components/common/Table.tsx
import React from 'react';

interface TableColumn {
  label: string;
  key: string;
  render?: (row: any) => React.ReactNode;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  actions?: (row: any) => React.ReactNode;
}

const Table: React.FC<TableProps> = ({ columns, data, actions }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-x-auto">
      <table className="min-w-full text-sm text-left text-gray-900">
        <thead className="bg-blue-100 text-blue-700 uppercase text-xs">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-4">
                {col.label}
              </th>
            ))}
            {actions && <th className="px-6 py-4">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                
                  {columns.map((col) => (
  <td key={col.key} className="px-6 py-4">
    {col.render ? col.render(row) : row[col.key]}
  </td>

                ))}
                {actions && (
                  <td className="px-6 py-4">{actions(row)}</td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="text-center py-4 text-gray-500"
              >
                No data found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
