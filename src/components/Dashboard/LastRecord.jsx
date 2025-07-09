// src/components/Dashboard/LastRecord.jsx
import React, { useEffect, useState } from 'react';
import { db, auth } from '../../services/firebase';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function LastRecord() {
  const [ultimoRegistro, setUltimoRegistro] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, 'usuarios', currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const cedula = docSnap.data().cedula;
          const q = query(collection(db, 'signos'), where('cedula', '==', cedula));
          onSnapshot(q, (snapshot) => {
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
            setUltimoRegistro(registrosConFecha[0]);
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const formatoFecha = (fecha) => {
    try {
      const f = fecha?.seconds ? new Date(fecha.seconds * 1000) : new Date(fecha);
      if (isNaN(f)) return 'Sin fecha';
      const opcionesFecha = { day: '2-digit', month: '2-digit', year: 'numeric' };
      const opcionesHora = { hour: '2-digit', minute: '2-digit', hour12: true };
      return `${f.toLocaleDateString('es-ES', opcionesFecha)} | ${f.toLocaleTimeString('es-ES', opcionesHora)}`;
    } catch {
      return 'Sin fecha';
    }
  };

  const fueraDeRango = (valor, min, max) => {
    const n = parseFloat(valor);
    return !isNaN(n) && (n < min || n > max);
  };

  const fueraDeRangoTension = (tension) => {
    if (!tension || typeof tension !== 'string') return false;
    const [sist, diast] = tension.split('/').map(Number);
    return isNaN(sist) || isNaN(diast) || sist < 90 || sist > 140 || diast < 60 || diast > 90;
  };

  const renderCampo = (label, valor, fueraRango, tooltip) => (
    <p className="flex items-center">
      <strong>{label}</strong>{' '}
      {fueraRango ? (
        <span
          title={tooltip}
          className="ml-1 text-red-600 bg-red-100 px-2 py-1 rounded inline-flex items-center gap-1"
        >
          {valor} <FaExclamationTriangle />
        </span>
      ) : (
        <span className="ml-1">{valor || 'No registrada'}</span>
      )}
    </p>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h2 className="text-2xl font-bold">Cargando último registro...</h2>
      </div>
    );
  }

  if (!ultimoRegistro) {
    return (
      <div className="text-center text-gray-600 text-lg">No hay registros disponibles</div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 m-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-blue-900 mb-4">Último Registro</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
        {renderCampo(
          'Temperatura:',
          ultimoRegistro.temperatura,
          fueraDeRango(ultimoRegistro.temperatura, 36, 37.5),
          'Temperatura fuera de rango (36 - 37.5 °C)'
        )}
        {renderCampo(
          'Saturación:',
          ultimoRegistro.saturacion,
          fueraDeRango(ultimoRegistro.saturacion, 92, 100),
          'Saturación fuera de rango (92 - 100%)'
        )}
        {renderCampo('Palpitaciones:', ultimoRegistro.palpitaciones, false, '')}
        {renderCampo(
          'Tensión:',
          ultimoRegistro.tension,
          fueraDeRangoTension(ultimoRegistro.tension),
          'Tensión fuera de rango (ideal 90/60 a 140/90)'
        )}
        {renderCampo(
          'Glucosa:',
          ultimoRegistro.glucosa,
          fueraDeRango(ultimoRegistro.glucosa, 70, 140),
          'Glucosa fuera de rango (70 - 140 mg/dL)'
        )}
        {renderCampo('Fecha:', formatoFecha(ultimoRegistro.fecha), false, '')}
        <div className="md:col-span-2">
          <p>
            <strong>Observaciones:</strong>{' '}
            {ultimoRegistro.observaciones ?? ultimoRegistro.observacion ?? 'Sin observaciones'}
          </p>
        </div>
      </div>
    </div>
  );
}
