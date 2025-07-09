import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import AdminStats from '../../components/AdminStats';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [signosVitales, setSignosVitales] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [cedulaSeleccionada, setCedulaSeleccionada] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [observaciones, setObservaciones] = useState(`El paciente presentó episodios aislados de hipertermia leve y frecuencia cardíaca elevada.

No se han reportado eventos críticos, pero se recomienda reforzar el monitoreo nocturno.

Se sugiere agendar una valoración médica si se repiten los episodios de temperatura elevada.`);
  const [epsSeleccionada, setEpsSeleccionada] = useState('');

  useEffect(() => {
    const fetchUsuarios = async () => {
      const usuariosRef = collection(db, 'usuarios');
      const snapshot = await getDocs(usuariosRef);
      const lista = snapshot.docs.map((doc) => doc.data());
      setUsuarios(lista);
    };

    const fetchSignosVitales = async () => {
      const signosRef = collection(db, 'signos');
      const snapshot = await getDocs(signosRef);
      const lista = snapshot.docs.map((doc) => doc.data());
      setSignosVitales(lista);
    };

    fetchUsuarios();
    fetchSignosVitales();
  }, []);

  const pacientes = usuarios.filter((u) => u.Rol?.toLowerCase() === 'cuidador/paciente');
  const cuidadores = usuarios.filter((u) => u.Rol?.toLowerCase() === 'cuidador');

  const pacientesFiltrados = pacientes.filter((p) =>
    p.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
    p.cedula?.toLowerCase().includes(filtro.toLowerCase()) ||
    p.eps?.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const generarInformePDF = () => {
    const paciente = pacientes.find((p) => p.cedula === cedulaSeleccionada);
    if (!paciente) return alert('Selecciona un paciente válido.');

    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin + 'T23:59:59');

    const registros = signosVitales
      .filter((s) => {
        const f = new Date(s.fecha?.seconds ? s.fecha.seconds * 1000 : s.fecha);
        return s.cedula === paciente.cedula && f >= fechaInicioDate && f <= fechaFinDate;
      })
      .sort((a, b) => new Date(b.fecha.seconds * 1000) - new Date(a.fecha.seconds * 1000));

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Informe de Parámetros Clínicos del Paciente', 14, 20);
    doc.setFontSize(11);
    doc.text('Emitido para: Sanitas EPS', 14, 28);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-CO')}`, 14, 34);
    doc.text('Responsable del informe: Plataforma de Gestión Clínica – Clínica Vida Salud', 14, 40);

    doc.setFont('helvetica', 'bold');
    doc.text('A quien corresponda:', 14, 50);
    doc.setFont('times', 'normal');
    doc.text(
      `Por medio del presente informe, damos respuesta a la solicitud realizada por Sanitas EPS respecto al seguimiento de los parámetros clínicos del paciente identificado con número de cédula ${paciente.cedula}. El objetivo de este informe es presentar un resumen detallado de los signos vitales monitoreados durante el período comprendido entre el ${fechaInicio} y el ${fechaFin}.`,
      14,
      58,
      { maxWidth: 180 }
    );

    doc.setFont('helvetica', 'bold');
    doc.text('Datos resumidos del paciente:', 14, 90);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${paciente.nombre}`, 14, 98);
    doc.text(`Cédula: ${paciente.cedula}`, 14, 104);
    doc.text(`Afiliación: ${paciente.eps}`, 14, 110);
    doc.text(`Periodicidad de monitoreo: Diario`, 14, 116);

    doc.setFont('helvetica', 'bold');
    doc.text('Indicadores clínicos registrados:', 14, 126);

    autoTable(doc, {
      startY: 132,
      head: [['Fecha', 'Temperatura (°C)', 'Saturación (%)', 'Palpitaciones', 'Tensión', 'Glucosa (mg/dL)', 'Observaciones']],
      body: registros.map((r) => {
        const fecha = new Date(r.fecha.seconds * 1000).toLocaleDateString('es-CO');

        const temp = {
          content: r.temperatura ?? '-',
          styles: r.temperatura > 37.5 ? { textColor: [255, 255, 255], fillColor: [255, 102, 102], fontStyle: 'bold' } : {}
        };

        const sat = {
          content: r.saturacion ?? '-',
          styles: r.saturacion < 92 ? { textColor: [255, 255, 255], fillColor: [255, 102, 102], fontStyle: 'bold' } : {}
        };

        const pal = {
          content: r.palpitaciones ?? '-',
          styles: r.palpitaciones > 100 ? { textColor: [255, 255, 255], fillColor: [255, 102, 102], fontStyle: 'bold' } : {}
        };

        return [
          fecha,
          temp,
          sat,
          pal,
          r.tension || '-',
          r.glucosa || '-',
          r.observaciones || r.observacion || '-',
        ];
      }),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [72, 181, 107] },
    });

    let finalY = doc.lastAutoTable.finalY + 20;

    if (finalY > 240) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text('⚠️ Advertencia clínica:', 14, finalY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(
      'Se resalta en rojo los valores fuera de los rangos clínicos normales. Temperaturas mayores a 37.5°C, saturación menor a 92%, y palpitaciones superiores a 100 lpm fueron detectadas y marcadas para seguimiento.',
      14,
      finalY + 6,
      { maxWidth: 180 }
    );

    finalY += 30;
    doc.setFont('helvetica', 'bold');
    doc.text('Observaciones del profesional:', 14, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text(observaciones, 14, finalY + 8, { maxWidth: 180 });
finalY += 45; // o incluso 50 si lo quieres más amplio


    // ✅ Conclusión
  if (finalY > 240) {
    doc.addPage();
    finalY = 20;
  }
  doc.setFont('helvetica', 'bold');
  doc.text('Conclusión:', 14, finalY);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'El presente informe fue generado automáticamente por la plataforma clínica, con datos en tiempo real extraídos de los registros médicos del paciente. Puede ser utilizado por Sanitas EPS para fines de auditoría, seguimiento clínico o decisiones asistenciales.',
    14,
    finalY + 6,
    { maxWidth: 180 }
  );
  finalY += 36;

    doc.setFont('helvetica', 'italic');
    doc.text('Este documento ha sido generado automáticamente por la plataforma clínica.', 14, 285);

    doc.save(`informe_paciente_${paciente.cedula}.pdf`);
  };

  const generarConsolidadoEPS = () => {
    if (!epsSeleccionada) return alert('Selecciona una EPS');

    const pacientesEPS = pacientes.filter((p) => p.eps?.toLowerCase() === epsSeleccionada.toLowerCase());

    if (pacientesEPS.length === 0) return alert('No hay pacientes registrados con esta EPS');

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Informe Consolidado de Pacientes por EPS', 14, 20);
    doc.setFontSize(11);
    doc.text(`Entidad: ${epsSeleccionada}`, 14, 28);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CO')}`, 14, 34);

    doc.setFont('helvetica', 'bold');
    doc.text('Resumen de pacientes afiliados:', 14, 44);

       autoTable(doc, {
      startY: 42,
      head: [['Nombre', 'Cédula', 'Teléfono', 'Ciudad', 'Alertas']],
      body: pacientesEPS.map((p) => {
        const registros = signosVitales.filter((s) => s.cedula === p.cedula);
        const alertas = registros.filter((r) =>
          (r.temperatura > 37.5 || r.saturacion < 92 || r.palpitaciones > 100)
        ).length;

        const icono = alertas > 0 ? ` ${alertas} alerta(s)` : '✅ Sin alertas';

        return [
          p.nombre,
          p.cedula,
          p.telefono || '-',
          p.ciudad || '-',
          icono,
        ];
         }),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [72, 181, 107] },
    });

    let finalY = doc.lastAutoTable.finalY + 20;
    if (finalY > 240) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('Conclusión general:', 14, finalY);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Se ha detectado un total de ${pacientesEPS.length} paciente(s) afiliado(s) a ${epsSeleccionada}. Se recomienda priorizar seguimiento clínico a los pacientes con valores fuera de rango.`,
      14,
      finalY + 8,
      { maxWidth: 180 }
    );

    doc.save(`consolidado_${epsSeleccionada}.pdf`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-xl text-center font-semibold text-slate-800 mb-6">
        Plataforma Clínica – Panel del Profesional de Salud
      </h1>

      <div className="flex justify-center mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="border text-sm border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded shadow-sm transition"
        >
          🩺 Módulo de Monitoreo de Parámetros Vitales
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-green-700 font-semibold mb-2">Panel de Administrador</h2>
<AdminStats 
  totalUsuarios={usuarios.length} 
  totalCuidadores={pacientes.length} 
  totalSignosVitales={signosVitales.length} 
/>

        <input
          type="text"
          className="mt-4 w-full border rounded px-3 py-2 text-sm"
          placeholder="Buscar por nombre, cédula o EPS..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full text-sm border border-gray-200">
            <thead className="bg-green-100 text-green-800">
              <tr>
                <th className="px-4 py-2 border">Nombre</th>
                <th className="px-4 py-2 border">Cédula</th>
                <th className="px-4 py-2 border">Ciudad</th>
                <th className="px-4 py-2 border">EPS</th>
                <th className="px-4 py-2 border">Teléfono</th>
                <th className="px-4 py-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientesFiltrados.map((p, i) => (
                <tr key={i} className="text-center">
                  <td className="border px-2 py-1">{p.nombre}</td>
                  <td className="border px-2 py-1">{p.cedula}</td>
                  <td className="border px-2 py-1">{p.ciudad}</td>
                  <td className="border px-2 py-1">{p.eps}</td>
                  <td className="border px-2 py-1">{p.telefono}</td>
                  <td className="border px-2 py-1 space-x-2">
                    <button
                      onClick={() => navigate(`/admin/evolucion/${p.cedula}`)}
                      className="bg-blue-600 text-white px-2 py-1 text-xs rounded hover:bg-blue-700"
                    >
                      📊 Ver evolución
                    </button>
                    <button
                      onClick={() => navigate(`/admin/historial/${p.cedula}`)}
                      className="bg-green-600 text-white px-2 py-1 text-xs rounded hover:bg-green-700"
                    >
                      📋 Ver historial
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-green-700 font-semibold mb-2">Generar informe clínico personalizado</h2>
        <div className="flex flex-wrap gap-2 mb-3">
          <select
            value={cedulaSeleccionada}
            onChange={(e) => setCedulaSeleccionada(e.target.value)}
            className="border px-3 py-2 text-sm rounded w-full sm:w-1/3"
          >
            <option value="">Seleccionar paciente</option>
            {pacientes.map((p) => (
  <option key={p.cedula} value={p.cedula}>
    {p.nombre} - {p.cedula}
  </option>
))}

          
          </select>
          <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="border px-3 py-2 rounded text-sm" />
          <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="border px-3 py-2 rounded text-sm" />
        </div>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          className="w-full border rounded p-2 text-sm mb-2"
          rows="4"
        />
        <button onClick={generarInformePDF} className="bg-green-700 text-white px-4 py-2 rounded text-sm hover:bg-green-800">
          Generar PDF
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-green-700 font-semibold mb-3">Informe Consolidado por EPS</h2>
        <div className="flex items-center gap-2">
          <select
            value={epsSeleccionada}
            onChange={(e) => setEpsSeleccionada(e.target.value)}
            className="border px-3 py-2 text-sm rounded"
          >
            <option value="">Selecciona EPS</option>
            {[...new Set(pacientes.map((p) => p.eps?.toLowerCase()))].map((eps) => (
              <option key={eps} value={eps}>
                {eps}
              </option>
            ))}
          </select>
          <button onClick={generarConsolidadoEPS} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700">
            Generar Consolidado PDF
          </button>
        </div>
      </div>

      <div className="text-right mt-4">
        <button
          onClick={handleLogout}
          className="text-sm text-white bg-red-600 px-3 py-1 rounded hover:bg-red-700"
        >
          🔒 Cerrar sesión
        </button>
      </div>
    </div>
  );
}
