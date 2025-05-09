import { api } from './react-query';

export const useValidateMeld = (
  onSuccess: (data: boolean) => void
) => {
  return api.useMutation('post', '/api/v1/games/is-valid-meld', {
    onSuccess,
  });
};
