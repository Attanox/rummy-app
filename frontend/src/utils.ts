import { UniqueIdentifier } from '@dnd-kit/core';
import { TCard, TRank, TSuit } from './types';

export function getCardValues(cardIds: UniqueIdentifier[]): TCard[] {
  const rankValues: Record<TRank, number> = {
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
    SIX: 6,
    SEVEN: 7,
    EIGHT: 8,
    NINE: 9,
    TEN: 10,
    JACK: 10,
    QUEEN: 10,
    KING: 10,
    ACE: 10,
  };

  const meld = cardIds.map((id) => ({
    rank: getRank(id as string),
    suit: getSuit(id as string),
  }));

  return meld.map((card, index) => {
    const nextCard = meld[index + 1];
    const prevCard = meld[index - 1];

    if (card.rank === 'ACE') {
      // Decide whether Ace should be 1 or 10
      const nextValue = nextCard ? rankValues[nextCard.rank] : null;
      const prevValue = prevCard ? rankValues[prevCard.rank] : null;

      if (
        (nextValue && nextValue >= 10) ||
        (prevValue && prevValue >= 10)
      ) {
        return { ...card, value: 1 };
      } else {
        return { ...card, value: 10 };
      }
    }

    return { ...card, value: rankValues[card.rank] };
  });
}

export function getSuit(card: string) {
  const splitCard = card.split('-');

  return splitCard[1] as TSuit;
}

export function getRank(card: string) {
  const splitCard = card.split('-');
  return splitCard[0] as TRank;
}

export const NEW_GROUP = 'new_group';

export function clearEmptyMelds(melds: {
  [x: string]: UniqueIdentifier[];
}): { [key: string]: UniqueIdentifier[] } {
  const result: { [key: string]: UniqueIdentifier[] } = {};

  Object.keys(melds).forEach((key) => {
    if (!isEmpty(melds[key]) || key == NEW_GROUP) {
      result[key] = melds[key];
    }
  });

  return result;
}

function isEmpty(meld: UniqueIdentifier[]) {
  return meld.length === 0;
}
