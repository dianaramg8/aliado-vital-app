import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { FaArrowLeft, FaFilePdf, FaFileExcel } from 'react-icons/fa';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import GraficoVital from '../../components/GraficoVital';

export default function PacienteEvolucionPage() {
  const { cedula } = useParams();
  const [paciente, setPaciente] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [graficaActiva, setGraficaActiva] = useState('');
  const [modoAgrupacion, setModoAgrupacion] = useState('dia');
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const usuariosQuery = query(collection(db, 'usuarios'), where('cedula', '==', cedula));
        const usuariosSnap = await getDocs(usuariosQuery);
        if (!usuariosSnap.empty) {
          setPaciente(usuariosSnap.docs[0].data());
        }

        const signosQuery = query(collection(db, 'signos'), where('cedula', '==', cedula));
        const signosSnap = await getDocs(signosQuery);
        const datos = signosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(r => r.fecha)
          .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        setRegistros(datos);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [cedula]);

  const exportarPDF = () => {
    const docPDF = new jsPDF();
    docPDF.setFontSize(16);
    docPDF.text(`Evolución del Paciente: ${paciente?.nombre || ''}`, 14, 20);
    autoTable(docPDF, {
      startY: 28,
      head: [["Fecha", "Temp.", "Sat.", "Pulso", "Tensión", "Glucosa", "Obs"]],
      body: registros.map(r => [
        new Date(r.fecha).toLocaleString('es-CO'),
        r.temperatura,
        r.saturacion,
        r.palpitaciones,
        r.tension,
        r.glucosa ?? '-',
        r.observaciones ?? r.observacion ?? '-'
      ])
    });
    docPDF.save(`evolucion_${cedula}.pdf`);
  };

  const exportarExcel = () => {
    const datos = registros.map(r => ({
      Fecha: new Date(r.fecha).toLocaleString('es-CO'),
      Temperatura: r.temperatura,
      Saturacion: r.saturacion,
      Palpitaciones: r.palpitaciones,
      Tension: r.tension,
      Glucosa: r.glucosa ?? '-',
      Observaciones: r.observaciones ?? r.observacion ?? '-'
    }));
    const ws = XLSX.utils.json_to_sheet(datos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Evolucion');
    XLSX.writeFile(wb, `evolucion_${cedula}.xlsx`);
  };
  const agruparFecha = (fechaStr, modo) => {
    const fecha = new Date(fechaStr);
    if (isNaN(fecha)) return 'Sin fecha';

    const hoy = new Date();
    const ayer = new Date();
    ayer.setDate(hoy.getDate() - 1);

    const esMismaFecha = (f1, f2) =>
      f1.getDate() === f2.getDate() &&
      f1.getMonth() === f2.getMonth() &&
      f1.getFullYear() === f2.getFullYear();

    if (modo === 'hoy' && esMismaFecha(fecha, hoy)) {
      return fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    }

    if (modo === 'ayer' && esMismaFecha(fecha, ayer)) {
      return fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    }

    if (modo === 'mes') {
      return fecha.toLocaleString('default', { year: 'numeric', month: 'short' });
    }

    if (modo === 'semana') {
      const año = fecha.getFullYear();
      const primeraFecha = new Date(año, 0, 1);
      const dias = Math.floor((fecha - primeraFecha) / (24 * 60 * 60 * 1000));
      const semana = Math.ceil((dias + primeraFecha.getDay() + 1) / 7);
      return `Semana ${semana} - ${año}`;
    }

    return fecha.toLocaleDateString('es-CO');
  };

  const procesarDatos = (campo, transformFn = v => parseFloat(v)) => {
    if (modoAgrupacion === 'hoy' || modoAgrupacion === 'ayer') {
      return registros
        .filter(r => {
          if (!r.fecha || r[campo] === undefined) return false;
          const fecha = new Date(r.fecha);
          const desdeDate = desde ? new Date(desde) : null;
          const hastaDate = hasta ? new Date(hasta) : null;
          if ((desdeDate && fecha < desdeDate) || (hastaDate && fecha > hastaDate)) return false;

          const hoy = new Date();
          const ayer = new Date();
          ayer.setDate(hoy.getDate() - 1);

          const esMismaFecha = (f1, f2) =>
            f1.getDate() === f2.getDate() &&
            f1.getMonth() === f2.getMonth() &&
            f1.getFullYear() === f2.getFullYear();

          return (modoAgrupacion === 'hoy' && esMismaFecha(fecha, hoy)) ||
                 (modoAgrupacion === 'ayer' && esMismaFecha(fecha, ayer));
        })
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        .map(r => ({
          fecha: new Date(r.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
          [campo]: parseFloat(r[campo])
        }));
    }

    const agrupados = new Map();

    registros.forEach(r => {
      if (!r.fecha || r[campo] === undefined) return;

      const fechaRegistro = new Date(r.fecha);
      const desdeDate = desde ? new Date(desde) : null;
      const hastaDate = hasta ? new Date(hasta) : null;

      if ((desdeDate && fechaRegistro < desdeDate) || (hastaDate && fechaRegistro > hastaDate)) return;

      const claveGrupo = agruparFecha(r.fecha, modoAgrupacion);
      const valor = transformFn(r[campo]);
      if (isNaN(valor)) return;

      if (!agrupados.has(claveGrupo)) {
        agrupados.set(claveGrupo, { suma: valor, contador: 1 });
      } else {
        const grupo = agrupados.get(claveGrupo);
        grupo.suma += valor;
        grupo.contador += 1;
        agrupados.set(claveGrupo, grupo);
      }
    });

    return Array.from(agrupados.entries()).map(([fecha, grupo]) => ({
      fecha,
      [campo]: parseFloat((grupo.suma / grupo.contador).toFixed(2))
    }));
  };

  const dataTemperatura = procesarDatos('temperatura');
  const dataSaturacion = procesarDatos('saturacion');
  const dataPalpitaciones = procesarDatos('palpitaciones');
  const dataGlucosa = procesarDatos('glucosa');

  const dataTension = (() => {
    const agrupados = new Map();

    registros.forEach(r => {
      if (!r.fecha || !r.tension) return;
      const fechaRegistro = new Date(r.fecha);
      const desdeDate = desde ? new Date(desde) : null;
      const hastaDate = hasta ? new Date(hasta) : null;

      if ((desdeDate && fechaRegistro < desdeDate) || (hastaDate && fechaRegistro > hastaDate)) return;

      const claveGrupo = agruparFecha(r.fecha, modoAgrupacion);
      const [sis, dia] = r.tension.split('/').map(Number);
      if (isNaN(sis) || isNaN(dia)) return;

      if (!agrupados.has(claveGrupo)) {
        agrupados.set(claveGrupo, { sistolica: sis, diastolica: dia, contador: 1 });
      } else {
        const grupo = agrupados.get(claveGrupo);
        grupo.sistolica += sis;
        grupo.diastolica += dia;
        grupo.contador += 1;
        agrupados.set(claveGrupo, grupo);
      }
    });

    return Array.from(agrupados.entries()).map(([fecha, grupo]) => ({
      fecha,
      sistolica: parseFloat((grupo.sistolica / grupo.contador).toFixed(2)),
      diastolica: parseFloat((grupo.diastolica / grupo.contador).toFixed(2)),
    }));
  })();

  const botones = [
    { key: 'temperatura', label: 'Temperatura Corporal' },
    { key: 'saturacion', label: 'Saturación de Oxígeno' },
    { key: 'palpitaciones', label: 'Palpitaciones' },
    { key: 'glucosa', label: 'Glucosa' },
    { key: 'tension', label: 'Tensión Arterial' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-green-800">Evolución del Paciente</h1>
        <Link to="/admin" className="text-blue-600 hover:underline flex items-center">
          <FaArrowLeft className="mr-1" /> Volver
        </Link>
      </div>
      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="text-md font-semibold text-blue-800 mb-3">📅 Filtro por Rango de Fechas</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-700 mb-1">Desde:</label>
            <input type="date" className="border p-2 rounded w-full" value={desde} onChange={e => setDesde(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-700 mb-1">Hasta:</label>
            <input type="date" className="border p-2 rounded w-full" value={hasta} onChange={e => setHasta(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-700 mb-1">Agrupar por:</label>
            <select className="border p-2 rounded w-full" value={modoAgrupacion} onChange={e => setModoAgrupacion(e.target.value)}>
              <option value="hoy">Hoy</option>
              <option value="ayer">Ayer</option>
              <option value="dia">Día</option>
              <option value="semana">Semana</option>
              <option value="mes">Mes</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-md font-semibold mb-4 text-blue-800">📈 Ver Gráfica</h2>
        <div className="flex flex-wrap gap-2">
          {botones.map(btn => (
            <button
              key={btn.key}
              className={`px-3 py-1 rounded text-sm border ${graficaActiva === btn.key ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-blue-600'}`}
              onClick={() => setGraficaActiva(btn.key)}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {graficaActiva === 'temperatura' && (
        <GraficoVital data={dataTemperatura} dataKey="temperatura" titulo="Temperatura Corporal" color="#e67e22" unidad="°C" domain={[34, 40]} ticks={[34, 35, 36, 37, 38, 39, 40]} />
      )}
      {graficaActiva === 'saturacion' && (
        <GraficoVital data={dataSaturacion} dataKey="saturacion" titulo="Nivel de Saturación de Oxígeno" color="#1abc9c" unidad="%" domain={[85, 100]} ticks={[85,86,87,88,89,90,91,92,93,94,95,96,97,98,99,100]} />
      )}
      {graficaActiva === 'palpitaciones' && (
        <GraficoVital data={dataPalpitaciones} dataKey="palpitaciones" titulo="Palpitaciones por Minuto" color="#9b59b6" unidad="bpm" domain={[50, 120]} ticks={[50,55,60,65,70,75,80,85,90,95,100,105,110,115,120]} />
      )}
      {graficaActiva === 'glucosa' && (
        <GraficoVital data={dataGlucosa} dataKey="glucosa" titulo="Niveles de Glucosa" color="#2c3e50" unidad="mg/dL" domain={[60, 160]} />
      )}
      {graficaActiva === 'tension' && (
        <GraficoVital data={dataTension} dataKey="sistolica" titulo="Tensión Arterial (Sistólica / Diastólica)" color="#2980b9" unidad="mmHg" domain={[90, 160]} combinada={true} />
      )}

      <div className="flex flex-wrap gap-4 mt-8">
        <button onClick={exportarPDF} className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <FaFilePdf /> Exportar PDF
        </button>
        <button onClick={exportarExcel} className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
          <FaFileExcel /> Exportar Excel
        </button>
        <Link
          to={`/admin/historial/${cedula}`}
          className="bg-gray-800 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          📄 Ver Historial Completo
        </Link>
      </div>
    </div>
  );
}
