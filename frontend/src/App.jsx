import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts & Guards
import Layout from './components/Layout';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Documents from './pages/Documents';
import Folders from './pages/Folders';
import DocumentEditor from './pages/DocumentEditor';
import DocumentViewer from './pages/DocumentViewer';

// Smart Home: redirects admin to admin dashboard, user to user dashboard
const SmartHome = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminDashboard /> : <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            {/* Admin gets its own full-page layout (has its own sidebar) */}
            <Route path="/" element={<SmartHome />} />

            {/* Document Editor is a full screen interface like Laravel's create.blade.php */}
            <Route path="/documents/:id/edit" element={<DocumentEditor />} />

            {/* Standard user pages with Layout sidebar */}
            <Route element={<Layout />}>
              <Route path="/documents/:id/view" element={<DocumentViewer />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/folders" element={<Folders />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
