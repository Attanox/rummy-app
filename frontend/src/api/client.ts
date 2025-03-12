import createClient, { ClientOptions } from 'openapi-fetch';
import { paths } from './schema';
import { useAuthStore } from '../store/authStore';

// TODO: implement ENV variable for baseURl
export const client = createClient<paths>({
  baseUrl: 'http://localhost:8080/',
  fetch: async (url, options: ClientOptions = {}) => {
    const token = useAuthStore.getState().token;
    const headers = {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      credentials: 'include',
      'Content-Type': 'application/json',
      method: url.method,
    };

    console.log('headers', headers);

    return fetch(url, {
      ...options,
      headers,
    });
  },
});
