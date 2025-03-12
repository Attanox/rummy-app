import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import GameLobbyPage from './routes/GameLobbyPage';
import AuthLayout from './layouts/AuthLayout';
import LoginPage from './routes/LoginPage';
import RegisterPage from './routes/RegisterPage';
import ProtectedRoute from './ProtectedRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route index path="/" element={<GameLobbyPage />} />
          </Route>

          {/* Redirect root to dashboard or login based on auth state */}
          <Route path="/" element={<Navigate to="/dashboard" />} />

          {/* Fallback for unmatched routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
