import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Challans from './pages/Challans';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <div>Unauthorized</div>;

  return <>{children}</>;
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/customers" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'SALES']}>
          <Layout><Customers /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/products" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE', 'SALES']}>
          <Layout><Products /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/challans" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'SALES']}>
          <Layout><Challans /></Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
