import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';

import Dashboard from '../components/Dashboard/Dashboard';
import Layout from '../components/Layout'; // ✅ Se añadió el layout
import Swal from 'sweetalert2';

export default function DashboardPage() {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [ultimoRegistro, setUltimoRegistro] = useState(null);
  const [signos, setSignos] = useState({
    temperatura: '',
    saturacion: '',
    palpitaciones: '',
    tension: '',
    glucosa: '',
    observacion: ''
  });
  const [loading, setLoading] = useState(true);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerDatosPaciente = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'usuarios', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);

            const registrosQuery = query(
              collection(db, 'usuarios', user.uid, 'signos_vitales'),
              orderBy('fecha', 'desc'),
              limit(1)
            );
            const registrosSnapshot = await getDocs(registrosQuery);

            if (!registrosSnapshot.empty) {
              const data = registrosSnapshot.docs[0].data();
              setUltimoRegistro({
                ...data,
                observacion: data.observacion || ''
              });
            }
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Paciente no encontrado',
              text: 'No se encontró información del paciente.'
            });
          }
        } catch (error) {
          console.error(error);
          Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            text: 'No fue posible cargar los datos.'
          });
        } finally {
          setLoading(false);
        }
      }
    };

    obtenerDatosPaciente();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { temperatura, saturacion, palpitaciones, tension } = signos;

    if (!temperatura || !saturacion || !palpitaciones || !tension) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Completa todos los campos obligatorios.'
      });
      return;
    }

    try {
      await addDoc(collection(db, 'signos'), {
        ...signos,
        fecha: new Date().toISOString(),
        cedula: userData?.cedula || 'sin-cedula'
      });

      await addDoc(collection(db, 'usuarios', user.uid, 'signos_vitales'), {
        ...signos,
        fecha: serverTimestamp()
      });

      Swal.fire({
        icon: 'success',
        title: 'Registro exitoso',
        showConfirmButton: false,
        timer: 2000
      });

      setSignos({
        temperatura: '',
        saturacion: '',
        palpitaciones: '',
        tension: '',
        glucosa: '',
        observacion: ''
      });

      setTimeout(async () => {
        const registrosQuery = query(
          collection(db, 'usuarios', user.uid, 'signos_vitales'),
          orderBy('fecha', 'desc'),
          limit(1)
        );
        const registrosSnapshot = await getDocs(registrosQuery);
        if (!registrosSnapshot.empty) {
          const data = registrosSnapshot.docs[0].data();
          setUltimoRegistro({
            ...data,
            observacion: data.observacion || ''
          });
        }
      }, 1000);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: 'Error de registro',
        text: 'Intenta nuevamente más tarde.'
      });
    }
  };

  const handleLogout = async () => {
    try {
      setCerrandoSesion(true);
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error al cerrar sesión',
        text: 'Intenta de nuevo.'
      });
      setCerrandoSesion(false);
    }
  };

  if (cerrandoSesion) return null;

  return (
    <Layout>
      <Dashboard
        userData={userData}
        ultimoRegistro={ultimoRegistro}
        signos={signos}
        setSignos={setSignos}
        handleSubmit={handleSubmit}
        loading={loading}
        handleLogout={handleLogout}
      />
    </Layout>
  );
}
