// src/pages/AdminPanel.jsx
import React from "react";

const pacientes = [
  { nombre: "paola", cedula: "123456", ciudad: "bucaramanga", eps: "sanitas", telefono: "12345678" },
  { nombre: "camilo", cedula: "88888888", ciudad: "piedecuesta", eps: "sura", telefono: "6879799" },
  { nombre: "Jhon", cedula: "000000", ciudad: "floridablanca", eps: "nueva eps", telefono: "75544677" },
  { nombre: "paola", cedula: "1234567", ciudad: "bucaramanga", eps: "sanitas", telefono: "12346789" },
];

export default function AdminPanel() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Título */}
      <h1 className="text-2xl font-bold text-green-700 mb-6">
        🛡️ Panel de Administrador
      </h1>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 text-center border-t-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Usuarios Totales</p>
          <p className="text-3xl font-bold text-green-600">7</p>
        </div>
        <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 text-center border-t-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Pacientes/Cuidadores</p>
          <p className="text-3xl font-bold text-blue-600">5</p>
        </div>
        <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 text-center border-t-4 border-red-500">
          <p className="text-gray-600 text-sm font-medium mb-1">Signos Vitales</p>
          <p className="text-3xl font-bold text-red-600">51</p>
        </div>
      </div>

      {/* Buscador */}
      <input
        type="text"
        placeholder="🔍 Buscar por nombre, cédula o EPS..."
        className="w-full mb-6 p-3 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
      />

      {/* Tabla pacientes */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <h2 className="bg-green-100 px-4 py-3 text-lg font-semibold text-green-800 border-b">
          👥 Pacientes registrados
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-green-50 text-green-700 font-semibold">
              <tr>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Cédula</th>
                <th className="px-4 py-2">Ciudad</th>
                <th className="px-4 py-2">EPS</th>
                <th className="px-4 py-2">Teléfono</th>
                <th className="px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((p, idx) => (
                <tr key={idx} className="hover:bg-green-50">
                  <td className="px-4 py-2">{p.nombre}</td>
                  <td className="px-4 py-2">{p.cedula}</td>
                  <td className="px-4 py-2 capitalize">{p.ciudad}</td>
                  <td className="px-4 py-2 capitalize">{p.eps}</td>
                  <td className="px-4 py-2">{p.telefono}</td>
                  <td className="px-4 py-2 flex flex-wrap gap-2">
                    <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm">
                      Ver evolución
                    </button>
                    <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm">
                      Ver historial
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
