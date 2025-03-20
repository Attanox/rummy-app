import { create } from 'zustand';
import type { components } from '../api/schema';

type Game = components['schemas']['GameDto'];

interface LobbyStore {
  games: Array<Game>;
  setGames: (games: Array<Game>) => void;
}

export const useLobbyStore = create<LobbyStore>((set) => ({
  games: [],
  setGames: (games) => set({ games }),
}));
