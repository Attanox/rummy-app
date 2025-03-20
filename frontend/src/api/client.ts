import createClient, { ClientOptions } from 'openapi-fetch';
import { paths } from './schema';
import { useAuthStore } from '../store/authStore';


// TODO: implement ENV variable for baseURl
export const client = createClient<paths>({
  baseUrl: 'http://localhost:8080/',
  fetch: async (url, options: ClientOptions = {}) => {
    const {token , clearAuth,setAuth} = useAuthStore.getState();
    const headers = {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      credentials: 'include',
      'Content-Type': 'application/json',
      method: url.method,
    };

    let res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      // attempt refresh
      const refreshRes = await fetch('/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setAuth(data.user, data.token);

        // retry original request with new token
        res = await fetch(url, {
          ...options,
          headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        });
      } else {
        clearAuth();
      }
    }

    return res;
  },
});
