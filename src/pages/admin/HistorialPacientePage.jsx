import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../../services/firebase';
import {
  collection,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { FaExclamationTriangle, FaFilePdf, FaFileExcel, FaArrowLeft } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function HistorialPacientePage() {
  const { cedula } = useParams();
  const navigate = useNavigate();

  const [registros, setRegistros] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  const registrosPorPagina = 10;
  const totalPaginas = Math.ceil(filtrados.length / registrosPorPagina);
  const registrosPaginados = filtrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  useEffect(() => {
    if (!cedula) return navigate('/admin');

    const q = query(collection(db, 'signos'), where('cedula', '==', cedula));
    const unsub = onSnapshot(q, (snapshot) => {
      const datos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const registrosConFecha = datos.filter((r) => {
        const f = r.fecha?.seconds ? new Date(r.fecha.seconds * 1000) : new Date(r.fecha);
        return r.fecha && !isNaN(f);
      });
      registrosConFecha.sort((a, b) => {
        const fa = a.fecha?.seconds ? new Date(a.fecha.seconds * 1000) : new Date(a.fecha);
        const fb = b.fecha?.seconds ? new Date(b.fecha.seconds * 1000) : new Date(b.fecha);
        return fb - fa;
      });
      setRegistros(registrosConFecha);
      setFiltrados(registrosConFecha);
      setLoading(false);
    });

    return () => unsub();
  }, [cedula, navigate]);

  const formatoFecha = (fecha) => {
    try {
      const f = fecha?.seconds ? new Date(fecha.seconds * 1000) : new Date(fecha);
      if (isNaN(f)) return 'Sin fecha';
      const opcionesFecha = { day: '2-digit', month: '2-digit', year: 'numeric' };
      const opcionesHora = { hour: '2-digit', minute: '2-digit', hour12: true };
      return `${f.toLocaleDateString('es-CO', opcionesFecha)} | ${f.toLocaleTimeString('es-CO', opcionesHora)}`;
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

  const aplicarFiltros = () => {
    const filtrados = registros.filter((registro) => {
      const fechaRegistro = registro.fecha?.seconds ? new Date(registro.fecha.seconds * 1000) : new Date(registro.fecha);
      const cumpleBusqueda = Object.values(registro).some((v) =>
        String(v).toLowerCase().includes(busqueda.toLowerCase())
      );
      const cumpleFechaInicio = fechaInicio ? fechaRegistro >= new Date(fechaInicio) : true;
      const cumpleFechaFin = fechaFin ? fechaRegistro <= new Date(fechaFin + 'T23:59:59') : true;
      return cumpleBusqueda && cumpleFechaInicio && cumpleFechaFin;
    });
    setFiltrados(filtrados);
    setPaginaActual(1);
  };

  useEffect(() => {
    aplicarFiltros();
  }, [busqueda, fechaInicio, fechaFin, registros]);

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Historial clínico – Cédula: ${cedula}`, 14, 20);
    autoTable(doc, {
      startY: 28,
      head: [['Fecha', 'Temp.', 'Sat.', 'Pulso', 'Tensión', 'Glucosa', 'Observaciones']],
      body: filtrados.map((r) => [
        formatoFecha(r.fecha),
        r.temperatura,
        r.saturacion,
        r.palpitaciones,
        r.tension,
        r.glucosa ?? '-',
        r.observaciones ?? r.observacion ?? '-'
      ])
    });
    doc.save(`historial_${cedula}.pdf`);
  };

  const exportarExcel = () => {
    const datos = filtrados.map((r) => ({
      Fecha: formatoFecha(r.fecha),
      Temperatura: r.temperatura,
      Saturación: r.saturacion,
      Palpitaciones: r.palpitaciones,
      Tensión: r.tension,
      Glucosa: r.glucosa ?? 'No registrada',
      Observaciones: r.observaciones ?? r.observacion ?? '-'
    }));
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historial');
    XLSX.writeFile(wb, `historial_${cedula}.xlsx`);
  };

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
        <h1 className="text-xl md:text-2xl font-bold text-green-800">Historial de Parámetros Clínicos del Paciente</h1>
        <Link to="/admin" className="text-blue-600 hover:underline flex items-center gap-1">
          <FaArrowLeft /> Volver
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <input type="text" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="p-2 rounded border w-full sm:w-auto" />
        <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="p-2 rounded border" />
        <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="p-2 rounded border" />
        <button onClick={exportarPDF} className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <FaFilePdf /> PDF
        </button>
        <button onClick={exportarExcel} className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <FaFileExcel /> Excel
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-lg font-semibold">Cargando registros...</div>
      ) : filtrados.length === 0 ? (
        <p className="text-gray-600">No hay registros disponibles.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 bg-white text-sm">
              <thead className="bg-green-100 text-green-800">
                <tr>
                  <th className="p-3 border">Fecha</th>
                  <th className="p-3 border">Temperatura</th>
                  <th className="p-3 border">Saturación</th>
                  <th className="p-3 border">Palpitaciones</th>
                  <th className="p-3 border">Tensión</th>
                  <th className="p-3 border">Glucosa</th>
                  <th className="p-3 border">Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {registrosPaginados.map((r) => (
                  <tr key={r.id} className="text-center hover:bg-gray-100">
                    <td className="border p-2">{formatoFecha(r.fecha)}</td>
                    <td className="border p-2">{fueraDeRango(r.temperatura, 36, 37.5) ? (
                      <span className="text-red-600 bg-red-100 px-2 py-1 rounded inline-flex items-center gap-1">
                        {r.temperatura} <FaExclamationTriangle />
                      </span>
                    ) : r.temperatura}</td>
                    <td className="border p-2">{fueraDeRango(r.saturacion, 92, 100) ? (
                      <span className="text-red-600 bg-red-100 px-2 py-1 rounded inline-flex items-center gap-1">
                        {r.saturacion} <FaExclamationTriangle />
                      </span>
                    ) : r.saturacion}</td>
                    <td className="border p-2">{r.palpitaciones}</td>
                    <td className="border p-2">{fueraDeRangoTension(r.tension) ? (
                      <span className="text-red-600 bg-red-100 px-2 py-1 rounded inline-flex items-center gap-1">
                        {r.tension} <FaExclamationTriangle />
                      </span>
                    ) : r.tension}</td>
                    <td className="border p-2">{!r.glucosa ? 'No registrada' : fueraDeRango(r.glucosa, 70, 140) ? (
                      <span className="text-red-600 bg-red-100 px-2 py-1 rounded inline-flex items-center gap-1">
                        {r.glucosa} <FaExclamationTriangle />
                      </span>
                    ) : r.glucosa}</td>
                    <td className="border p-2">{r.observaciones ?? r.observacion ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center mt-4 space-x-2">
            <button onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">Anterior</button>
            <span className="px-4 py-2 text-gray-700 font-semibold">Página {paginaActual} de {totalPaginas}</span>
            <button onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">Siguiente</button>
          </div>
        </>
      )}
    </div>
  );
}
