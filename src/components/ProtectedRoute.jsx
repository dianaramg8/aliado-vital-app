import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../services/firebase';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function ProtectedRoute({ children, requiredRole }) {
  const [user, loading] = useAuthState(auth);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        try {
          const usuariosRef = collection(db, 'usuarios');
          const q = query(usuariosRef, where('cedula', '==', user.email.split('@')[0]));
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            setUserRole(data.Rol?.toLowerCase());
          } else {
            setUserRole(null); // Role not found
          }
        } catch (err) {
          console.error('Error al obtener el rol:', err);
          setUserRole(null);
        }
      }
    };

    if (user) {
      fetchUserRole();
    }
  }, [user]);

  // Mientras carga el estado de la autenticación o el rol, no renderizamos nada.
  if (loading || userRole === null) {
    return null;  // Puedes retornar un spinner o algo visual mientras carga
  }

  // Si no hay usuario autenticado, redirige al login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Si el rol del usuario no coincide con el rol requerido, redirige a la página de acceso denegado
  if (requiredRole && userRole !== requiredRole.toLowerCase()) {
    return <Navigate to="/no-autorizado" replace />;
  }

  // Si todo está correcto, renderiza los hijos (la ruta protegida)
  return children;
}
