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
    <>
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <dl key={rowKey(row)} className="min-w-0 rounded-lg border border-green-100 bg-white p-3 shadow-sm">
            {columns.map((column) => (
              <div key={column.key} className="min-w-0 py-2 first:pt-0 last:pb-0">
                {column.header && <dt className="mb-1 text-xs font-semibold text-green-800">{column.header}</dt>}
                <dd className="min-w-0 break-words text-sm text-gray-800">{column.render(row)}</dd>
              </div>
            ))}
          </dl>
        ))}
      </div>
      <div className="hidden min-w-0 max-w-full overflow-x-auto md:block" tabIndex={0} role="region" aria-label="Data table">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-green-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-3 py-2 text-start font-semibold text-green-800 ${column.className ?? ""}`}
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
    </>
  );
}
