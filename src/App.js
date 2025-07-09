import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout'; // Asegúrate de tener este archivo

// Lazy load de las páginas
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const Historial = lazy(() => import('./pages/Historial'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AccessDenied = lazy(() => import('./pages/AccessDenied'));

const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const PacienteEvolucionPage = lazy(() => import('./pages/admin/PacienteEvolucionPage'));
const HistorialPacientePage = lazy(() => import('./pages/admin/HistorialPacientePage'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Dashboard para cuidadores/pacientes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="cuidador/paciente">
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/historial"
            element={
              <ProtectedRoute requiredRole="cuidador/paciente">
                <Historial />
              </ProtectedRoute>
            }
          />

          {/* Panel del administrador con Layout profesional */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="administrador">
                <Layout>
                  <AdminDashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/paciente/:cedula"
            element={
              <ProtectedRoute requiredRole="administrador">
                <Layout>
                  <PacienteEvolucionPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/historial/:cedula"
            element={
              <ProtectedRoute requiredRole="administrador">
                <Layout>
                  <HistorialPacientePage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Acceso denegado y no encontrado */}
          <Route path="/no-autorizado" element={<AccessDenied />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
