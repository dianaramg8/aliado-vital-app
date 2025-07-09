import { Stethoscope } from 'lucide-react';

export default function HeaderLayout() {
  return (
    <div>
      {/* Barra superior */}
      <header className="bg-white shadow-md py-4 fixed w-full top-0 z-50">
        <h1 className="text-center text-xl font-semibold text-gray-900">
          Plataforma Clínica – Panel del Profesional de Salud
        </h1>
      </header>

      {/* Espacio para no tapar contenido por header fijo */}
      <div className="h-16"></div>

      {/* Barra inferior (tarjeta) */}
      <div className="flex justify-center mt-6">
        <div className="bg-white shadow-lg rounded-2xl px-8 py-4 max-w-2xl w-full animate-fade-in">
          <div className="flex items-center justify-center space-x-2 text-gray-700">
            <Stethoscope className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-sm sm:text-base">
              Módulo de Monitoreo de Parámetros Vitales
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
