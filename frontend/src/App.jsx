import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import Landing from './pages/Landing.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import CrearSala from './pages/CrearSala.jsx';
import DetalleSala from './pages/DetalleSala.jsx';
import UnirseSala from './pages/UnirseSala.jsx';
import SalaChat from './pages/SalaChat.jsx';
import ErrorPage from './pages/ErrorPage.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/salas/nueva"
              element={
                <ProtectedRoute>
                  <CrearSala />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/salas/:id"
              element={
                <ProtectedRoute>
                  <DetalleSala />
                </ProtectedRoute>
              }
            />
            <Route path="/unirse" element={<UnirseSala />} />
            <Route path="/sala/:id" element={<SalaChat />} />
            <Route path="/error" element={<ErrorPage />} />
            <Route path="*" element={<Navigate to="/error" replace />} />
          </Routes>
        </SocketProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
