import React from 'react';

export default function CardTable({ title, columns = [], data = [], renderActions }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mt-8">
      <h2 className="text-xl font-bold text-green-700 mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-green-100">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="border border-gray-300 p-3 text-sm font-semibold capitalize text-gray-700">
                  {col}
                </th>
              ))}
              {renderActions && <th className="border border-gray-300 p-3 text-sm font-semibold text-center text-gray-700">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((item, idx) => (
                <tr key={idx} className="hover:bg-green-50 transition-all">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="border border-gray-200 p-2 text-sm text-gray-800">
                      {item[col]}
                    </td>
                  ))}
                  {renderActions && (
                    <td className="border border-gray-200 p-2 text-center">{renderActions(item)}</td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="text-center p-4 text-gray-400">
                  No hay registros disponibles.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
