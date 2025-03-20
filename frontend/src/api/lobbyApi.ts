import { api } from "./react-query";


export const useGames = () =>
  api.useQuery('get', '/api/v1/games', {

  })

export const useCreateGame = (refetch: () => void) =>
  api.useMutation('post', '/api/v1/games', {
    body: {
      
    },
    onSuccess() {
      refetch();
    },
  })