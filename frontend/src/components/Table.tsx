import type { ReactNode } from "react";

import { EmptyState } from "./States";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

type Props<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  empty?: string;
};

export default function Table<T>({ columns, rows, rowKey, empty = "No records found" }: Props<T>) {
  if (rows.length === 0) return <EmptyState title={empty} />;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-green-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-3 py-2 text-left font-semibold text-green-800 ${column.className ?? ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="hover:bg-green-50/50">
              {columns.map((column) => (
                <td key={column.key} className={`px-3 py-2 align-middle ${column.className ?? ""}`}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
