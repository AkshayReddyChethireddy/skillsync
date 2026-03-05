import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { AuthGuard } from './components/auth/AuthGuard';
import { AppShell } from './components/layout/AppShell';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Skills } from './pages/Skills';
import { SkillDetail } from './pages/SkillDetail';
import { LogProgress } from './pages/LogProgress';

function AppRoutes() {
  const { isAuthenticated, fetchMe } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchMe();
    }
  }, []);

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* Protected */}
      <Route element={<AuthGuard><AppShell /></AuthGuard>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/skills/:skillId" element={<SkillDetail />} />
        <Route path="/log" element={<LogProgress />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
