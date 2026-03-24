import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { useAuth } from '../features/auth/auth-context';
import { LoginPage } from '../features/auth/LoginPage';
import { AdminsPage } from '../features/admins/AdminsPage';
import { TopicsPage } from '../features/topics/TopicsPage';
import { ExerciseItemsPage } from '../features/exercise-items/ExerciseItemsPage';
import { AppLayout } from './AppLayout';

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
          <Route path="/topics" element={<TopicsPage />} />
          <Route path="/topics/:topicId/items" element={<ExerciseItemsPage />} />
          <Route path="/admins" element={<AdminsPage />} />
          <Route path="/" element={<Navigate to="/topics" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
