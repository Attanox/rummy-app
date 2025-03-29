import { create } from "zustand";
import { components } from "../api/schema";

type TCard = components['schemas']['Card'];

type RummyStore = {
  cards: TCard[][]; // 2D array of card strings
  setInitialCards: (hand: Array<TCard>) => void;
  addGroup: () => void;
  addCardToGroup: (groupIndex: number, card: TCard) => void;
  moveCardBetweenGroups: (
    fromGroupIndex: number,
    toGroupIndex: number,
    cardIndex: number
  ) => void;
  moveCardWithinGroup: (
    groupIndex: number,
    oldIndex: number,
    newIndex: number
  ) => void;
};

export const useGameStore = create<RummyStore>((set) => ({
  cards: [[]], // Initialize with one empty group
  setInitialCards: (hand) =>
    set((state) => ({ ...state, cards: [[...hand]] })),
  addGroup: () =>
    set((state) => ({
      cards: [...state.cards, []],
    })),
  addCardToGroup: (groupIndex, card) =>
    set((state) => {
      const newcards = [...state.cards];
      newcards[groupIndex].push(card);
      return { cards: newcards };
    }),
  moveCardBetweenGroups: (fromGroupIndex, toGroupIndex, cardIndex) =>
    set((state) => {
      const newcards = [...state.cards];
      const [movedCard] = newcards[fromGroupIndex].splice(
        cardIndex,
        1
      ); // Remove the card from the original group
      newcards[toGroupIndex].push(movedCard); // Add the card to the new group
      return { cards: newcards };
    }),
  moveCardWithinGroup: (groupIndex, oldIndex, newIndex) =>
    set((state) => {
      const newcards = [...state.cards];
      const group = [...newcards[groupIndex]];
      const [movedCard] = group.splice(oldIndex, 1); // Remove card
      group.splice(newIndex, 0, movedCard); // Add card at new position
      newcards[groupIndex] = group; // Update the group
      return { cards: newcards };
    }),
}));

