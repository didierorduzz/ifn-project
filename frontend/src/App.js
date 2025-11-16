import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public
import Home from './pages/Home';
import Login from './pages/auth/Login';

// Brigadista
import DashboardBrigadista from './pages/brigadista/Dashboard';
import RegistrarConglomerado from './pages/admin/RegistrarConglomerado';
import RegistrarSubparcela from './pages/admin/RegistrarSubparcela';
import RegistrarArbol from './pages/brigadista/RegistrarArbol';
import RegistrarMuestra from './pages/brigadista/RegistrarMuestra';
import MisReportes from './pages/brigadista/MisReportes';
import MisAsignaciones from './pages/brigadista/MisAsignaciones';
import ActualizarPerfil from './pages/brigadista/ActualizarPerfil';

// Admin
import DashboardAdmin from './pages/admin/Dashboard';
import GestionBrigadistas from './pages/admin/GestionBrigadistas';
import GestionZonas from './pages/admin/GestionZonas';
import ReportesAdmin from './pages/admin/Reportes';
import Estadisticas from './pages/admin/Estadisticas';
import Configuracion from './pages/admin/Configuracion';

import './styles/App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Rutas del Brigadista */}
          <Route
            path="/brigadista"
            element={
              <ProtectedRoute requiredRole="brigadista">
                <DashboardBrigadista />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brigadista/arbol"
            element={
              <ProtectedRoute requiredRole="brigadista">
                <RegistrarArbol />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brigadista/muestra"
            element={
              <ProtectedRoute requiredRole="brigadista">
                <RegistrarMuestra />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brigadista/asignaciones"
            element={
              <ProtectedRoute requiredRole="brigadista">
                <MisAsignaciones />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brigadista/reportes"
            element={
              <ProtectedRoute requiredRole="brigadista">
                <MisReportes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brigadista/perfil"
            element={
              <ProtectedRoute requiredRole="brigadista">
                <ActualizarPerfil />
              </ProtectedRoute>
            }
          />

          {/* Rutas del Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <DashboardAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/brigadistas"
            element={
              <ProtectedRoute requiredRole="admin">
                <GestionBrigadistas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/conglomerado"
            element={
              <ProtectedRoute requiredRole="admin">
                <RegistrarConglomerado />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/subparcela"
            element={
              <ProtectedRoute requiredRole="admin">
                <RegistrarSubparcela />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/zonas"
            element={
              <ProtectedRoute requiredRole="admin">
                <GestionZonas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reportes"
            element={
              <ProtectedRoute requiredRole="admin">
                <ReportesAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/estadisticas"
            element={
              <ProtectedRoute requiredRole="admin">
                <Estadisticas />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/configuracion"
            element={
              <ProtectedRoute requiredRole="admin">
                <Configuracion />
              </ProtectedRoute>
            }
          />

          {/* Redirección para rutas no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;