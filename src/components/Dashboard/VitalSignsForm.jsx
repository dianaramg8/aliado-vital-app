// src/components/VitalSignsForm.jsx
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import Swal from 'sweetalert2';

export default function VitalSignsForm({ cedula }) {
  const [signos, setSignos] = useState({
    temperatura: '',
    saturacion: '',
    palpitaciones: '',
    tension: '',
    glucosa: '',
    observacion: ''
  });

  const campos = [
    { nombre: 'temperatura', label: 'Temperatura' },
    { nombre: 'saturacion', label: 'Saturación' },
    { nombre: 'palpitaciones', label: 'Palpitaciones' },
    { nombre: 'tension', label: 'Tensión Arterial' },
    { nombre: 'glucosa', label: 'Glucosa' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignos((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'signos'), {
        ...signos,
        cedula,
        fecha: serverTimestamp()
      });

      Swal.fire({
        icon: 'success',
        title: 'Signos registrados',
        text: 'Los signos vitales se guardaron correctamente.',
        timer: 2000,
        showConfirmButton: false
      });

      setSignos({
        temperatura: '',
        saturacion: '',
        palpitaciones: '',
        tension: '',
        glucosa: '',
        observacion: ''
      });
    } catch (error) {
      console.error('Error al guardar signos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron guardar los signos vitales.'
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow mb-8 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-900 mb-4 text-center">
        Registrar Signos Vitales
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {campos.map(({ nombre, label }) => (
          <input
            key={nombre}
            type="text"
            name={nombre}
            placeholder={label}
            value={signos[nombre]}
            onChange={handleChange}
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            required
          />
        ))}

        {/* Campo Observaciones */}
        <textarea
          name="observacion"
          placeholder="Observaciones"
          value={signos.observacion}
          onChange={handleChange}
          rows={3}
          className="md:col-span-3 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm resize-none"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transform hover:scale-105 transition-all md:col-span-3"
        >
          Registrar
        </button>
      </form>
    </div>
  );
}
