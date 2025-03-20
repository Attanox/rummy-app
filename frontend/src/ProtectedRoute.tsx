import React from 'react'
import { Navigate, Outlet } from 'react-router';
import { useAuthStore } from './store/authStore';

interface ProtectedRouteProps {
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  redirectPath = '/login',
}) => {
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  // if (isAuthenticated) {
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  //     </div>
  //   );
  // }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to={redirectPath} />
  );
};

export default ProtectedRoute