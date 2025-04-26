import { api } from './react-query';

export const useValidateMeld = () => {
  return api.useMutation('post', '/api/v1/games/is-valid-meld');
};
