// src/pages/AuditoriaPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuditoriaPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-green-700">🧭 Panel de Auditoría / Administración</h1>
        <p className="text-gray-600">Gestión centralizada de pacientes, registros y alertas clínicas.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => navigate('/auditoria/dashboard')}
          className="p-6 bg-white shadow hover:shadow-md transition rounded border border-green-200"
        >
          📊 Panel de Control General
        </button>
        <button
          onClick={() => navigate('/auditoria/pacientes')}
          className="p-6 bg-white shadow hover:shadow-md transition rounded border border-green-200"
        >
          👥 Gestión de Pacientes
        </button>
        <button
          onClick={() => navigate('/auditoria/alertas')}
          className="p-6 bg-white shadow hover:shadow-md transition rounded border border-green-200"
        >
          🚨 Alertas Clínicas
        </button>
        <button
          onClick={() => navigate('/auditoria/informes')}
          className="p-6 bg-white shadow hover:shadow-md transition rounded border border-green-200"
        >
          📝 Informes para EPS
        </button>
      </section>
    </div>
  );
}
