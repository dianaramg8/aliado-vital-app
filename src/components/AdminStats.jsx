import React from 'react';

export default function AdminStats({ totalUsuarios, totalCuidadores, totalSignosVitales }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      <div className="bg-white rounded-2xl shadow p-4 text-center">
        <h2 className="text-xl font-bold text-gray-700">Usuarios totales</h2>
        <p className="text-3xl text-green-600 font-semibold">{totalUsuarios}</p>
      </div>
      <div className="bg-white rounded-2xl shadow p-4 text-center">
        <h2 className="text-xl font-bold text-gray-700">Pacientes/Cuidadores</h2>
        <p className="text-3xl text-blue-600 font-semibold">{totalCuidadores}</p>
      </div>
      <div className="bg-white rounded-2xl shadow p-4 text-center">
        <h2 className="text-xl font-bold text-gray-700">Signos Vitales</h2>
        <p className="text-3xl text-red-600 font-semibold">{totalSignosVitales}</p>
      </div>
    </div>
  );
}
