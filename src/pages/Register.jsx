// src/pages/Register.jsx
import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Layout from '../components/Layout'; // ✅ Se integra el Layout

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    edad: '',
    eps: '',
    patologia: '',
    medicamentos: '',
    tipoSangre: '',
    alergias: '',
    direccion: '',
    telefono: '',
    ciudad: '',
    correo: '',
    rol: 'cuidador',
    codigo: ''
  });

  const [showCodigo, setShowCodigo] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const correo = formData.correo || `${formData.cedula}@aliadovital.com`;
    const password = formData.cedula;
    const CODIGO_VALIDO = process.env.REACT_APP_CODIGO_SECRETO;

    if (!formData.cedula || !formData.nombre || !formData.rol) {
      return Swal.fire({
        icon: 'warning',
        title: 'Campos obligatorios',
        text: 'Complete al menos cédula, nombre y rol.',
      });
    }

    if (formData.rol === 'admin' && formData.codigo !== CODIGO_VALIDO) {
      return Swal.fire({
        icon: 'error',
        title: 'Código secreto inválido',
        text: 'El código ingresado no es correcto para crear un administrador.',
      });
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, correo, password);
      const user = userCred.user;

      const userData = {
        ...formData,
        correo,
        uid: user.uid,
        creadoEn: new Date(),
      };

      delete userData.codigo;

      await setDoc(doc(db, 'usuarios', user.uid), userData);

      Swal.fire({
        icon: 'success',
        title: 'Usuario registrado',
        text: `El ${formData.rol === 'admin' ? 'administrador' : 'cuidador'} ha sido creado correctamente.`,
      });

      navigate('/');
    } catch (error) {
      console.error('Error al registrar:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error en el registro',
        text: 'No se pudo registrar el usuario. Verifique los datos.',
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-3xl">
          <h1 className="text-2xl font-bold text-center text-green-800 mb-6">Registrar nuevo usuario</h1>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="cedula" value={formData.cedula} onChange={handleChange} placeholder="Cédula" required className="p-3 border rounded" />
            <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre completo" required className="p-3 border rounded" />
            <input type="text" name="ciudad" value={formData.ciudad} onChange={handleChange} placeholder="Ciudad" className="p-3 border rounded" />
            <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Teléfono / Celular" className="p-3 border rounded" />
            <input type="email" name="correo" value={formData.correo} onChange={handleChange} placeholder="Correo (opcional)" className="p-3 border rounded" />

            <select name="rol" value={formData.rol} onChange={handleChange} className="p-3 border rounded" required>
              <option value="cuidador">👨‍⚕️ Cuidador / Paciente</option>
              <option value="admin">🧑‍💼 Administrador</option>
            </select>

            {formData.rol === 'admin' && (
              <div className="col-span-1 md:col-span-2 relative">
                <input
                  type={showCodigo ? 'text' : 'password'}
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChange}
                  placeholder="Código secreto para administrador"
                  className="p-3 border rounded w-full pr-12"
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-blue-600"
                  onClick={() => setShowCodigo(!showCodigo)}
                >
                  {showCodigo ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            )}

            {formData.rol === 'cuidador' && (
              <>
                <input type="number" name="edad" value={formData.edad} onChange={handleChange} placeholder="Edad" className="p-3 border rounded" />
                <input type="text" name="eps" value={formData.eps} onChange={handleChange} placeholder="EPS" className="p-3 border rounded" />
                <input type="text" name="patologia" value={formData.patologia} onChange={handleChange} placeholder="Patología" className="p-3 border rounded" />
                <input type="text" name="medicamentos" value={formData.medicamentos} onChange={handleChange} placeholder="Medicamentos administrados" className="p-3 border rounded" />
                <input type="text" name="tipoSangre" value={formData.tipoSangre} onChange={handleChange} placeholder="Tipo de sangre" className="p-3 border rounded" />
                <input type="text" name="alergias" value={formData.alergias} onChange={handleChange} placeholder="Alergias" className="p-3 border rounded" />
                <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} placeholder="Dirección" className="p-3 border rounded" />
              </>
            )}

            <button type="submit" className="col-span-full py-3 bg-green-600 text-white rounded hover:bg-green-700">
              Registrar
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-gray-600">
            ¿Ya tiene cuenta?{' '}
            <button onClick={() => navigate('/')} className="text-blue-600 font-medium hover:underline">
              Iniciar sesión
            </button>
          </p>
        </div>
      </div>
    </Layout>
  );
}
