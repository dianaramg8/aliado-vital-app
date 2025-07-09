import React from 'react';
import { FaArrowCircleRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ResumenSignos from './ResumenSignos';

export default function Dashboard({
  userData,
  ultimoRegistro,
  signos,
  setSignos,
  handleSubmit,
  loading,
  handleLogout
}) {
  const navigate = useNavigate();

  const formatoFecha = (fecha) => {
    try {
      const f = fecha?.seconds ? new Date(fecha.seconds * 1000) : new Date(fecha);
      if (isNaN(f)) return 'Sin fecha';
      return `${f.toLocaleDateString('es-CO')} | ${f.toLocaleTimeString('es-CO')}`;
    } catch {
      return 'Sin fecha';
    }
  };

  const fueraDeRango = (valor, min, max) => {
    const n = parseFloat(valor);
    return !isNaN(n) && (n < min || n > max);
  };

  const fueraDeRangoTension = (tensionStr) => {
    if (!tensionStr || typeof tensionStr !== 'string') return false;
    const [sist, diast] = tensionStr.split('/').map(Number);
    return isNaN(sist) || isNaN(diast) || sist < 90 || sist > 140 || diast < 60 || diast > 90;
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <header className="mb-6 border-b pb-4">
        <div className="flex justify-end">
  <button
    onClick={handleLogout}
    className="text-sm text-white bg-emerald-600 px-3 py-1 rounded hover:bg-emerald-700 transition-colors shadow"
  >
    🔒 Cerrar sesión
  </button>
</div>

      </header>

      {ultimoRegistro && (
        <ResumenSignos
          signos={{
            temperatura: ultimoRegistro.temperatura || 'No registrada',
            saturacion: ultimoRegistro.saturacion || 'No registrada',
            palpitaciones: ultimoRegistro.palpitaciones || 'No registradas',
            tension: ultimoRegistro.tension || 'No registrada',
            glucosa: ultimoRegistro.glucosa || 'No registrada'
          }}
        />
      )}

      <section className="bg-white rounded shadow p-4 mb-6">
        <h2 className="text-md font-bold text-blue-800 mb-3 border-b pb-1">
          📑 Información del Paciente
        </h2>
        <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
          <p><strong>👨‍⚕️ Nombre completo:</strong> {userData?.nombre}</p>
          <p><strong>🆔 Número de identificación:</strong> {userData?.cedula}</p>
          <p><strong>🎂 Edad:</strong> {userData?.edad}</p>
          <p><strong>📞 Teléfono:</strong> {userData?.telefono}</p>
          <p><strong>🌆 Ciudad:</strong> {userData?.ciudad}</p>
          <p><strong>📧 Correo electrónico:</strong> {userData?.correo || 'No registrado'}</p>
          <p><strong>📍 Dirección de residencia:</strong> {userData?.direccion || 'No registrada'}</p>
        </div>
      </section>

      <section className="bg-white rounded shadow p-4 mb-6">
        <h2 className="text-md font-bold text-blue-800 mb-3 border-b pb-1">
          🧬 Ficha Técnica Médica
        </h2>
        <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
          <p><strong>🩸 Tipo de Sangre:</strong> {userData?.tipoSangre}</p>
          <p><strong>📋 Patología:</strong> {userData?.patologia}</p>
          <p><strong>💊 Medicamentos administrados:</strong> {userData?.medicamentos}</p>
          <p><strong>⚠️ Alergias:</strong> {userData?.alergias || 'No registradas'}</p>
          <p className="md:col-span-2">
            <strong>📝 Observaciones Médicas:</strong> {userData?.observacionesMedicas || 'No registradas'}
          </p>
        </div>
      </section>

      <section className="bg-white rounded shadow p-4 mb-6">
        <h2 className="text-md font-bold text-red-700 mb-3 border-b pb-1">
          🕒 Último Registro de Parámetros Vitales
        </h2>
        {ultimoRegistro ? (
          <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
            <p><strong>🌡️ Temperatura:</strong> {fueraDeRango(ultimoRegistro.temperatura, 36, 37.5) ? <span className="text-red-600 font-semibold">{ultimoRegistro.temperatura} ⚠️</span> : ultimoRegistro.temperatura}</p>
            <p><strong>💓 Saturación:</strong> {fueraDeRango(ultimoRegistro.saturacion, 92, 100) ? <span className="text-red-600 font-semibold">{ultimoRegistro.saturacion} ⚠️</span> : ultimoRegistro.saturacion}</p>
            <p><strong>❤️ Palpitaciones:</strong> {ultimoRegistro.palpitaciones}</p>
            <p><strong>🩺 Tensión arterial:</strong> {fueraDeRangoTension(ultimoRegistro.tension) ? <span className="text-red-600 font-semibold">{ultimoRegistro.tension} ⚠️</span> : ultimoRegistro.tension}</p>
            <p><strong>🧪 Glucosa:</strong> {ultimoRegistro.glucosa || 'No registrada'}</p>
            <p><strong>📅 Fecha de Registro:</strong> {formatoFecha(ultimoRegistro.fecha)}</p>
            <p className="md:col-span-2"><strong>📝 Observaciones:</strong> {ultimoRegistro.observacion || '-'}</p>
          </div>
        ) : <p className="text-gray-500">No hay registros disponibles</p>}
      </section>

      <form onSubmit={handleSubmit} className="bg-white rounded shadow p-4 mb-6">
        <h2 className="text-md font-bold text-blue-800 mb-3 border-b pb-1">
          📝 Registro de Nuevos Parámetros Vitales
        </h2>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {['temperatura', 'saturacion', 'palpitaciones', 'tension', 'glucosa'].map((field, index) => (
            <input
              key={index}
              name={field}
              placeholder={`${field.charAt(0).toUpperCase() + field.slice(1)}${field === 'tension' ? ' (ej: 120/80)' : ''}`}
              value={signos[field]}
              onChange={(e) => setSignos({ ...signos, [field]: e.target.value })}
              className="p-2 border rounded w-full"
            />
          ))}
        </div>
        <textarea
          name="observacion"
          placeholder="Observaciones clínicas"
          value={signos.observacion}
          onChange={(e) => setSignos({ ...signos, observacion: e.target.value })}
          className="w-full p-2 border rounded mb-4"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
        >
          Guardar Registro
        </button>
      </form>

      <div className="flex justify-center">
        <button
          onClick={() => navigate('/historial')}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          <FaArrowCircleRight className="inline mr-2" /> Ver Historial de Registros
        </button>
      </div>
    </div>
  );
}
