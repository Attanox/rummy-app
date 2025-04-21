import React, { useEffect } from 'react';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { IGameState } from '../hooks/useGameSocket';
import { components } from '../api/schema';
import PlayingCard from './PlayingCard';

const NEW_GROUP = 'new_group';

const getId = () => Math.random().toString(16).slice(2);

const getCardId = (c: TCard) => `${c.rank}-${c.suit}-${getId()}`;

const Hand = ({
  hand,
  discardCard,
}: {
  hand: IGameState['hand'];
  discardCard: (suit: string, rank: string) => void;
}) => {
  const [items, setItems] = React.useState<{
    [key: string]: Array<UniqueIdentifier>;
  }>({
    hand: hand?.map(getCardId) || [],
    [NEW_GROUP]: [],
  });

  useEffect(() => {
    if (hand.length !== 15) return;
    const drawnCard = hand[hand.length - 1];
    console.log('drawFromDeck', drawnCard);
    setItems((items) => ({
      ...items,
      hand: [...items.hand, getCardId(drawnCard)],
    }));
  }, [hand]);

  const [activeId, setActiveId] =
    React.useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  console.log('items', items);

  return (
    <div className="flex flex-row">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <DiscardPile />

        {Object.keys(items).map((key) => (
          <CardGroup key={key} id={key} cards={items[key]} />
        ))}

        <DragOverlay>
          {activeId ? (
            <CardWrapper card={activeId as string}>
              {(rank, suit) => (
                <PlayingCard rank={rank} suit={suit} />
              )}
            </CardWrapper>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );

  function findContainer(id: UniqueIdentifier) {
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) => items[key].includes(id));
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const { id } = active;

    setActiveId(id);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    const { id } = active;
    if (!over) return;
    const { id: overId } = over;

    // Find the containers
    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer
    ) {
      return;
    }

    setItems((prev) => {
      console.log('dragOver');
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];

      // Find the indexes for the items
      const activeIndex = activeItems.indexOf(id);
      const overIndex = overItems.indexOf(overId);

      let newIndex;
      if (overId in prev) {
        // We're at the root droppable of a container
        newIndex = overItems.length + 1;
      } else {
        newIndex =
          overIndex >= 0 ? overIndex + 1 : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter(
            (item) => item !== active.id
          ),
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          items[activeContainer][activeIndex],
          ...prev[overContainer].slice(
            newIndex,
            prev[overContainer].length
          ),
        ],
      };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    const { id } = active;
    if (!over) return;
    const { id: overId } = over;

    console.log('dragEnd');

    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (overId === 'discard_pile') {
      setItems((items) => {
        return clearEmptyMelds({
          ...items,
          ['hand']: items['hand'].filter(
            (handCardId) => handCardId !== id
          ),
        });
      });
      discardCard(getSuit(id as string), getRank(id as string));
      return;
    }

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      setItems((items) => clearEmptyMelds({ ...items }));
      return;
    }

    const activeIndex = items[activeContainer].indexOf(active.id);
    const overIndex = items[overContainer].indexOf(overId);

    if (overContainer === NEW_GROUP) {
      setItems((items) => {
        return clearEmptyMelds({
          ...items,
          [`meld${Object.keys(items).length + 1}`]: arrayMove(
            items[overContainer],
            activeIndex,
            overIndex
          ),
          [NEW_GROUP]: [],
        });
      });
      return;
    }
    if (activeIndex !== overIndex) {
      setItems((items) => {
        return clearEmptyMelds({
          ...items,
          [overContainer]: arrayMove(
            items[overContainer],
            activeIndex,
            overIndex
          ),
        });
      });
    }

    setActiveId(null);
  }
};

const containerStyle: React.CSSProperties = {
  background: '#dadada',
  padding: 10,
  margin: 10,
  flex: 1,
  display: 'flex',
  flexDirection: 'row', // Change to row for horizontal layout
};

export function CardGroup(props: {
  id: string;
  cards: UniqueIdentifier[];
}) {
  const { id, cards } = props;

  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <SortableContext
      id={id}
      items={cards}
      strategy={horizontalListSortingStrategy} // Use horizontal strategy
    >
      <div ref={setNodeRef} style={containerStyle}>
        {cards.map((id: UniqueIdentifier, index: number) => (
          <SortableItem key={`${id}-${index}`} id={id} />
        ))}
      </div>
    </SortableContext>
  );
}

export function Item(props: { id: string }) {
  const { id } = props;

  const style = {
    width: 100, // Adjust width to fit horizontally
    height: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid black',
    margin: '0 10px', // Adjust margin for horizontal spacing
    background: 'white',
  };

  return <div style={style}>{id}</div>;
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

type TCard = components['schemas']['Card'];

type TRank = NonNullable<TCard['rank']>;
type TSuit = NonNullable<TCard['suit']>;

function getSuit(card: string) {
  const splitCard = card.split('-');

  return splitCard[1] as TSuit;
}

function getRank(card: string) {
  const splitCard = card.split('-');
  return splitCard[0] as TRank;
}

const CardWrapper = ({
  card,
  children,
}: {
  card: string;
  children: (rank: TRank, suit: TSuit) => React.ReactNode;
}) => {
  const rank = getRank(card);
  const suit = getSuit(card);

  return <React.Fragment>{children(rank, suit)}</React.Fragment>;
};

function clearEmptyMelds(melds: {
  [x: string]: UniqueIdentifier[];
}): { [key: string]: UniqueIdentifier[] } {
  const result: { [key: string]: UniqueIdentifier[] } = {};

  Object.keys(melds).forEach((key) => {
    console.log('melds[key]', melds[key]);
    if (!isEmpty(melds[key]) || key == NEW_GROUP) {
      console.log('adding');
      result[key] = melds[key];
    }
  });

  return result;
}

function isEmpty(meld: UniqueIdentifier[]) {
  return meld.length === 0;
}

const DiscardPile = () => {
  const { setNodeRef, isOver } = useDroppable({
    id: `discard_pile`,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex gap-2 items-center p-2 rounded border-2 ${
        isOver ? 'border-red-400 bg-red-100' : 'border-gray-300'
      }`}
    >
      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: '70px',
            height: '100px',
            border: '1px solid #333',
            borderRadius: '8px',
            backgroundColor: '#eee',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            top: '0',
            left: '0',
          }}
        ></div>
        <div
          style={{
            width: '70px',
            height: '100px',
            border: '1px solid #333',
            borderRadius: '8px',
            backgroundColor: '#eee',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            position: 'absolute',
            top: '0',
            left: '0',
            transform: 'rotate(15deg)',
          }}
        ></div>
      </div>
    </div>
  );
};

export default Hand;
