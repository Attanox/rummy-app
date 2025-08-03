import React from 'react';
import { UniqueIdentifier, useDroppable } from '@dnd-kit/core';
import { useGameStore } from '../store/gameStore';
import { useValidateMeld } from '../api/gameApi';
import { getCardValues, getRank, getSuit, NEW_GROUP } from '../utils';
import {
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PlayingCard, { CardWrapper } from './PlayingCard';

const containerStyle: React.CSSProperties = {
  background: '#dadada',
  padding: 10,
  margin: 10,
  flex: 1,
  display: 'flex',
  flexDirection: 'row',
};

function CardGroup(props: { id: string; cards: UniqueIdentifier[] }) {
  const { id, cards } = props;
  const [isDeclaring, setIsDeclaring] = React.useState(false);
  const { addDeclaring, removeDeclaring } = useGameStore();

  const { mutate: validateMeld, data } = useValidateMeld((data) => {
    if (data) {
      addDeclaring(getCardValues(cards), id);
    } else {
      removeDeclaring(id);
    }
    setIsDeclaring(data);
  });

  const { setNodeRef } = useDroppable({
    id,
  });

  React.useEffect(() => {
    validateMeld({
      body: {
        cards: cards.map((c) => {
          return {
            rank: getRank(c as string),
            suit: getSuit(c as string),
          };
        }),
      },
    });
  }, [cards, validateMeld]);

  return (
    <>
      {id !== 'hand' && id !== NEW_GROUP && (
        <input
          disabled={!data}
          checked={isDeclaring}
          onChange={(e) => {
            if (e.currentTarget.checked) {
              addDeclaring(getCardValues(cards), id);
            } else {
              removeDeclaring(id);
            }
            setIsDeclaring(e.currentTarget.checked);
          }}
          type="checkbox"
          className="checkbox checkbox-primary"
        />
      )}
      <SortableContext
        id={id}
        items={cards}
        strategy={horizontalListSortingStrategy}
      >
        <div ref={setNodeRef} style={containerStyle}>
          {cards.map((id: UniqueIdentifier, index: number) => (
            <SortableItem key={`${id}-${index}`} id={id} />
          ))}
        </div>
      </SortableContext>
    </>
  );
}

export function SortableItem(props: { id: UniqueIdentifier }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: props.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <CardWrapper card={props.id as string}>
        {(rank, suit) => <PlayingCard rank={rank} suit={suit} />}
      </CardWrapper>
    </div>
  );
}

export default CardGroup;
