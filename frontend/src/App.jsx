import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Books from './components/Books';
import MyBorrowings from './components/MyBorrowings';
import AddBook from './components/AddBook';
import AllBorrowings from './components/AllBorrowings';

// ============ PROTECTED ROUTE COMPONENT ============
// This ensures ONLY logged-in users can access these pages
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If NOT logged in, redirect to login page
  if (!user) {
    console.log('🔒 No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // If logged in, show the page
  return children;
}

// ============ PUBLIC ROUTE COMPONENT ============
// This redirects to dashboard if already logged in
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }
  
  // If already logged in, redirect to dashboard
  if (user) {
    console.log('👤 User already logged in, redirecting to dashboard');
    return <Navigate to="/" replace />;
  }
  
  return children;
}

// ============ ADMIN ONLY ROUTE ============
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'admin') {
    console.log('⛔ Non-admin user blocked from admin page');
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* PUBLIC ROUTES - Only when NOT logged in */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />
      
      {/* PROTECTED ROUTES - Require login */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/books" 
        element={
          <ProtectedRoute>
            <Layout>
              <Books />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-borrowings" 
        element={
          <ProtectedRoute>
            <Layout>
              <MyBorrowings />
            </Layout>
          </ProtectedRoute>
        } 
      />
      
      {/* ADMIN ONLY ROUTES */}
      <Route 
        path="/add-book" 
        element={
          <AdminRoute>
            <Layout>
              <AddBook />
            </Layout>
          </AdminRoute>
        } 
      />
      <Route 
        path="/all-borrowings" 
        element={
          <AdminRoute>
            <Layout>
              <AllBorrowings />
            </Layout>
          </AdminRoute>
        } 
      />
      
      {/* CATCH ALL - Redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;