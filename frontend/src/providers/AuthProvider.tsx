import React from 'react'
import { User } from '../openapi/requests';
import { useAuthenticationServiceGetApiV1AuthMe } from '../openapi/queries';

// Define context shape
type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: unknown;
};

// Create context with default values
const AuthContext = React.createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
});

const useIsAuthenticated = () => {
  return !!localStorage.getItem('auth_token');
};

// Context provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isAuthenticated = useIsAuthenticated();
  const { data: tokenResp, isLoading, error } = useAuthenticationServiceGetApiV1AuthMe();

  const value = {
    isAuthenticated,
    user: tokenResp?.user || null,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => React.useContext(AuthContext);
