import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { useAuth } from '../features/auth/auth-context';
import { LoginPage } from '../features/auth/LoginPage';
import { AppLayout } from './AppLayout';
import { AdminsPage } from '../features/admins/AdminsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return <>{children}</>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/categories" element={<div>Categories (placeholder)</div>} />
          <Route path="/word-sets" element={<div>Word Sets (placeholder)</div>} />
          <Route path="/words" element={<div>Words (placeholder)</div>} />
          <Route path="/admins" element={<AdminsPage />} />
          <Route path="/" element={<Navigate to="/categories" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
