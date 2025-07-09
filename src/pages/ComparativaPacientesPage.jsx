// src/pages/ComparativaPacientesPage.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import GraficoVital from '../../components/GraficoVital';

export default function ComparativaPacientesPage() {
  const [pacientes, setPacientes] = useState([]);
  const [seleccionados, setSeleccionados] = useState([]);
  const [registros, setRegistros] = useState([]);

  useEffect(() => {
    const fetchPacientes = async () => {
      const snap = await getDocs(collection(db, 'usuarios'));
      const data = snap.docs.map(doc => doc.data());
      setPacientes(data);
    };
    fetchPacientes();
  }, []);

  useEffect(() => {
    const fetchRegistros = async () => {
      if (seleccionados.length === 0) return;
      const q = query(collection(db, 'signos'), where('cedula', 'in', seleccionados));
      const snap = await getDocs(q);
      const datos = snap.docs.map(doc => doc.data()).filter(d => d.fecha);
      setRegistros(datos);
    };
    fetchRegistros();
  }, [seleccionados]);

  const procesarComparativa = (campo) => {
    return seleccionados.map(cedula => {
      return {
        cedula,
        data: registros
          .filter(r => r.cedula === cedula && r[campo] !== undefined)
          .map(r => ({
            fecha: new Date(r.fecha).toLocaleDateString('es-CO'),
            [campo]: parseFloat(r[campo]),
          }))
          .filter(r => !isNaN(r[campo]))
      };
    });
  };

  const compararTemperatura = procesarComparativa('temperatura');

  const toggleSeleccionado = (cedula) => {
    setSeleccionados(prev =>
      prev.includes(cedula) ? prev.filter(c => c !== cedula) : [...prev, cedula]
    );
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-blue-800">Comparativa entre Pacientes</h1>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-md font-semibold mb-2">Seleccionar Pacientes</h2>
        <div className="flex flex-wrap gap-2">
          {pacientes.map(p => (
            <button
              key={p.cedula}
              onClick={() => toggleSeleccionado(p.cedula)}
              className={`border px-3 py-1 rounded ${
                seleccionados.includes(p.cedula)
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-600 border-blue-600'
              }`}
            >
              {p.nombre} ({p.cedula})
            </button>
          ))}
        </div>
      </div>

      {compararTemperatura.length > 0 && (
        <GraficoVital
          data={compararTemperatura.flatMap(p =>
            p.data.map(d => ({ ...d, cedula: p.cedula }))
          )}
          dataKey="temperatura"
          titulo="Comparativa de Temperatura"
          color="#e67e22"
          unidad="°C"
          domain={[35, 42]}
          multipleSeriesKey="cedula"
        />
      )}
    </div>
  );
}
