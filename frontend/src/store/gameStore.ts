import { create } from 'zustand';
import { components } from '../api/schema';

type TCard = components['schemas']['Card'];

type RummyStore = {
  declaring: { [key: string]: Array<TCard> };
  addDeclaring: (declaringMeld: Array<TCard>, key: string) => void;
  removeDeclaring: (key: string) => void;
};

export const useGameStore = create<RummyStore>((set) => ({
  declaring: {},
  addDeclaring: (declaringMeld, key) =>
    set((state) => {
      const declaring = { ...state.declaring };
      declaring[key] = declaringMeld;
      return { ...state, declaring };
    }),
  removeDeclaring: (key) =>
    set((state) => {
      const declaring = { ...state.declaring };
      delete declaring[key];
      return { ...state, declaring };
    }),
}));
