import React from 'react';

export default function ProfileView({ userData }) {
  if (!userData) return null;

  return (
    <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-green-700 mb-4">Datos del Paciente</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <p><strong>Nombre:</strong> {userData.nombre || '-'}</p>
          <p><strong>Cédula:</strong> {userData.cedula || '-'}</p>
          <p><strong>Edad:</strong> {userData.edad || '-'}</p>
          <p><strong>Ciudad:</strong> {userData.ciudad || '-'}</p>
          <p><strong>Teléfono:</strong> {userData.telefono || '-'}</p>
          <p><strong>Correo:</strong> {userData.correo || '-'}</p>
        </div>

        <div>
          <p><strong>EPS:</strong> {userData.eps || '-'}</p>
          <p><strong>Patología:</strong> {userData.patologia || '-'}</p>
          <p><strong>Tipo de Sangre:</strong> {userData.tipoSangre || '-'}</p>
          <p><strong>Medicamentos:</strong> {userData.medicamentos || '-'}</p>
        </div>
      </div>
    </div>
  );
}
