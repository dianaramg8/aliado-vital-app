// src/pages/Login.jsx
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Layout from '../components/Layout'; // ✅ Se añadió el layout

export default function Login() {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleCedulaChange = (e) => {
    const cedulaInput = e.target.value.trim();
    setCedula(cedulaInput);
    setPassword(cedulaInput); // contraseña igual a la cédula
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!cedula) {
      Swal.fire({
        icon: 'warning',
        title: '⚠️ Cédula requerida',
        text: 'Por favor ingresa la cédula del usuario.',
        confirmButtonText: 'Ok'
      });
      return;
    }

    const correoTecnico = `${cedula}@aliadovital.com`;

    try {
      await signInWithEmailAndPassword(auth, correoTecnico, password);

      const usuariosRef = collection(db, 'usuarios');
      const q = query(usuariosRef, where('cedula', '==', cedula));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        throw new Error('Usuario no encontrado en Firestore.');
      }

      const userData = snapshot.docs[0].data();
      const rol = userData.Rol?.toLowerCase();

      Swal.fire({
        icon: 'success',
        title: '✅ Inicio de sesión exitoso',
        text: 'Bienvenido de nuevo',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true
      });

      if (rol === 'administrador') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }

    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: '❌ Error al iniciar sesión',
        text: 'Verifica tu cédula o comunícate con soporte.',
        confirmButtonText: 'Intentar de nuevo'
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md hover:shadow-green-200 transition-all transform hover:scale-105">
          <h1 className="text-4xl font-bold mb-6 text-center text-green-700 tracking-wide">AliadoVital</h1>
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-600">Iniciar Sesión</h2>

          <form onSubmit={handleLogin} className="grid grid-cols-1 gap-4">
            <input
              type="text"
              placeholder="Cédula del Usuario"
              value={cedula}
              onChange={handleCedulaChange}
              className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            <input
              type="password"
              placeholder="Contraseña (automática)"
              value={password}
              readOnly
              className="p-3 rounded-lg border border-gray-300 bg-gray-100 cursor-not-allowed"
            />

            <button
              type="submit"
              className="bg-gradient-to-r from-green-500 to-green-700 text-white py-3 rounded-lg hover:from-green-600 hover:to-green-800 transform hover:scale-105 transition-all"
            >
              Ingresar
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/register')}
              className="text-blue-600 font-semibold hover:underline transition-colors"
            >
              Registrar nuevo usuario
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
