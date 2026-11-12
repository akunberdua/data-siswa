import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedStudentRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        Memeriksa sesi login...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Jika admin membuka root dashboard, arahkan ke dashboard admin
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
        Memeriksa hak akses admin...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ fromAdmin: true }} replace />;
  }

  if (!isAdmin) {
    return (
      <Navigate
        to="/login"
        state={{
          fromAdmin: true,
          message:
            'Akses Ditolak: Anda saat ini masuk sebagai Siswa. Untuk mengakses Dashboard Admin (/admin), silakan masuk menggunakan akun Administrator.',
        }}
        replace
      />
    );
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Dashboard Siswa (Root) */}
              <Route
                path="/"
                element={
                  <ProtectedStudentRoute>
                    <StudentDashboard />
                  </ProtectedStudentRoute>
                }
              />

              {/* Dashboard Admin (/admin) */}
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminDashboard />
                  </ProtectedAdminRoute>
                }
              />

              {/* Autentikasi */}
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
