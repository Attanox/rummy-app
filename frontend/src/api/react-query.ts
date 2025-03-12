import createApi from 'openapi-react-query';
import { client } from './client';
import { paths } from './schema';

export const api = createApi<paths>(client);
