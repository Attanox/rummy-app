import { api } from './react-query';

export const useGames = () =>
  api.useQuery('get', '/api/v1/games', {});

export const useCreateGame = (refetch: () => void) =>
  api.useMutation('post', '/api/v1/games', {
    onSuccess() {
      refetch();
    },
  });

export const useJoinGame = () =>
  api.useMutation('post', '/api/v1/games/{id}/join', {});

export const useStartGame = () =>
  api.useMutation('post', '/api/v1/games/{id}/start', {});
