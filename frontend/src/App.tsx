import './App.css';
import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import GameLobbyPage from './routes/GameLobbyPage';
import AuthLayout from './layouts/AuthLayout';
import LoginPage from './routes/LoginPage';
import RegisterPage from './routes/RegisterPage';
import ProtectedRoute from './ProtectedRoute';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { useMe } from './api/authApi';
import AppLayout from './layouts/AppLayout';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const MeProvider = ({
  children,
}: React.PropsWithChildren<unknown>) => {
  const { isError } = useMe();
  const { clearAuth } = useAuthStore.getState();


  React.useEffect(() => {
    if (isError) {
      console.log('isError', isError);
      clearAuth();
    }
  }, [])


  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <MeProvider>
          <Routes>
            {/* Public routes */}
            <Route element={<AuthLayout />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
            </Route>

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index path="/" element={<GameLobbyPage />} />
              </Route>
            </Route>

            {/* Redirect root to dashboard or login based on auth state */}
            <Route path="/" element={<Navigate to="/dashboard" />} />

            {/* Fallback for unmatched routes */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </MeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
