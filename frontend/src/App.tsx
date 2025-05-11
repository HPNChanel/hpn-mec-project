import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeContextProvider } from './theme/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import type { ReactElement } from 'react';

// Layout components
import MainLayout from './components/layout/MainLayout';

// Page components
import LoginForm from './pages/Login/LoginForm';
import RegisterForm from './pages/Register/RegisterForm';
import Dashboard from './pages/Dashboard/Dashboard';
import AdminPanel from './pages/AdminPanel/AdminPanel';
import HealthForm from './pages/HealthForm/HealthForm';
import HealthHistory from './pages/HealthHistory/HealthHistory';
import HealthDetail from './pages/HealthDetail/HealthDetail';
import Settings from './pages/Settings/Settings';
import Calendar from './pages/Calendar/Calendar';
import Analytics from './pages/Analytics/Analytics';

// Protected route component with optional layout
const ProtectedRoute = ({ 
  children, 
  requiredRole = null,
  withLayout = true
}: { 
  children: ReactElement, 
  requiredRole?: 'admin' | 'user' | null,
  withLayout?: boolean
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return withLayout ? <MainLayout>{children}</MainLayout> : children;
};

function App() {
  return (
    <ThemeContextProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            
            {/* Protected routes with layout */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/health-form" 
              element={
                <ProtectedRoute>
                  <HealthForm />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/health-history" 
              element={
                <ProtectedRoute>
                  <HealthHistory />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/health-detail/:id" 
              element={
                <ProtectedRoute>
                  <HealthDetail />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/health-records" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/calendar" 
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <Analytics />
                </ProtectedRoute>
              } 
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeContextProvider>
  );
}

export default App;
