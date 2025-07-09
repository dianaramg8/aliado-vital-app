// src/pages/admin/PacienteDetalle.jsx

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../../services/firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  getDocs
} from 'firebase/firestore';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { FaArrowLeft } from 'react-icons/fa';

export default function PacienteDetalle() {
  const { id } = useParams(); // uid del paciente
  const navigate = useNavigate();
  const [datosPaciente, setDatosPaciente] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const docRef = doc(db, 'usuarios', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setDatosPaciente(docSnap.data());

          const q = query(
            collection(db, 'usuarios', id, 'signos_vitales'),
            orderBy('fecha', 'asc')
          );
          const snap = await getDocs(q);

          const registrosObtenidos = snap.docs.map((doc) => {
            const data = doc.data();
            const fecha = data.fecha?.seconds
              ? new Date(data.fecha.seconds * 1000)
              : new Date();
            return {
              ...data,
              fechaTexto: fecha.toLocaleDateString('es-CO'),
              fecha
            };
          });

          setRegistros(registrosObtenidos);
        } else {
          alert('Paciente no encontrado');
          navigate('/admin');
        }
      } catch (error) {
        console.error(error);
        alert('Error al cargar los datos del paciente');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-800">
          Evolución del Paciente
        </h1>
        <Link to="/admin" className="text-sm text-blue-600 hover:underline flex items-center">
          <FaArrowLeft className="mr-1" /> Volver al Panel
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-600">Cargando datos...</p>
      ) : (
        <>
          <div className="bg-white shadow rounded p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Datos del Paciente
            </h2>
            <p><strong>Nombre:</strong> {datosPaciente?.nombre}</p>
            <p><strong>Cédula:</strong> {datosPaciente?.cedula}</p>
            <p><strong>EPS:</strong> {datosPaciente?.eps}</p>
            <p><strong>Ciudad:</strong> {datosPaciente?.ciudad}</p>
          </div>

          <div className="bg-white shadow rounded p-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Gráfica de Evolución - Temperatura
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={registros} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fechaTexto" />
                <YAxis domain={[35, 42]} unit=" °C" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="temperatura" stroke="#e63946" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
