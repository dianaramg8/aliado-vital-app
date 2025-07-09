// src/pages/admin/AdminPacientesPage.jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';

export default function AdminPacientesPage() {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPacientes = async () => {
      const snapshot = await getDocs(collection(db, 'usuarios'));
      const lista = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => u.rol !== 'admin');
      setPacientes(lista);
    };
    fetchPacientes();
  }, []);

  const pacientesFiltrados = pacientes.filter(p =>
    (p.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.cedula || '').includes(busqueda) ||
    (p.eps || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.ciudad || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-green-800">Gestión de Pacientes</h1>
        <p className="text-gray-600 text-sm">Listado de todos los pacientes registrados.</p>
      </div>

      <input
        type="text"
        placeholder="Buscar por nombre, cédula, EPS o ciudad"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="p-3 border rounded w-full md:w-1/2 mb-4"
      />

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead className="bg-green-100 text-green-800">
            <tr>
              <th className="p-3 border">Nombre</th>
              <th className="p-3 border">Cédula</th>
              <th className="p-3 border">Edad</th>
              <th className="p-3 border">EPS</th>
              <th className="p-3 border">Ciudad</th>
              <th className="p-3 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pacientesFiltrados.map(p => (
              <tr key={p.id} className="text-center hover:bg-gray-50">
                <td className="p-2 border">{p.nombre}</td>
                <td className="p-2 border">{p.cedula}</td>
                <td className="p-2 border">{p.edad}</td>
                <td className="p-2 border">{p.eps}</td>
                <td className="p-2 border">{p.ciudad}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => navigate(`/admin/paciente/${p.cedula}`)}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Ver evolución
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
