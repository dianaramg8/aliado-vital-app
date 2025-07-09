import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Barra superior con título animado tipo marquesina */}
      <header className="bg-gradient-to-r from-blue-100 to-white shadow-md border-b py-4 px-6 overflow-hidden">
        <div className="w-full overflow-hidden">
          <h1 className="text-xl md:text-2xl font-semibold text-blue-900 animate-marquee">
            Plataforma Clínica – Panel del Profesional de Salud
          </h1>
        </div>
      </header>

      {/* Barra informativa secundaria centrada */}
      <div className="w-full flex justify-center py-6 px-4">
        <div className="w-full max-w-2xl bg-white shadow-md border border-blue-200 rounded-xl px-6 py-4 text-center">
          <h2 className="text-gray-700 text-base font-semibold tracking-wide">
            🩺 Módulo de Monitoreo de Parámetros Vitales
          </h2>
        </div>
      </div>

      {/* Contenido dinámico debajo */}
      <main className="px-4 pb-8">{children}</main>
    </div>
  );
}
