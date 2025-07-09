import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-md p-8 max-w-md text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">🚫 Acceso Denegado</h1>
        <p className="text-gray-700 mb-6">
          No tienes permiso para acceder a esta página. Verifica con tu administrador.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
