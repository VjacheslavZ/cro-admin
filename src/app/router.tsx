import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/LoginPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/categories" element={<div>Categories (placeholder)</div>} />
        <Route path="/word-sets" element={<div>Word Sets (placeholder)</div>} />
        <Route path="/words" element={<div>Words (placeholder)</div>} />
        <Route path="/" element={<Navigate to="/categories" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
