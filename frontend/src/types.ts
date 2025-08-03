import { components } from './api/schema';

export type TCard = components['schemas']['Card'];

export type TRank = NonNullable<TCard['rank']>;
export type TSuit = NonNullable<TCard['suit']>;
