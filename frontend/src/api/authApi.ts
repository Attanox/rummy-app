import { api } from './react-query';
import { useAuthStore } from '../store/authStore';

export const useLogin = () =>
  api.useMutation('post', '/api/v1/auth/login', {
    onSuccess: (data) => {
      const token = data.token;
      const user = data.user;
      useAuthStore.getState().setAuth(user!, token!);
    },
  });


export const useRegister = () =>
  api.useMutation('post', '/api/v1/auth/register', {
    onSuccess: (data) => {
      const token = data.token;
      const user = data.user;
      useAuthStore.getState().setAuth(user!, token!);
    },
  });

export const useLogout = () =>
  api.useMutation('post', '/api/v1/auth/logout', {
    onSuccess: () => {
      useAuthStore.getState().clearAuth();
    },
  });

export const useMe = () =>
  api.useQuery('get', '/api/v1/auth/me', {
    enabled: !!useAuthStore((s) => s.token),
    
  });

