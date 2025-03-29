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

const Hand = ({ hand }: { hand: IGameState['hand'] }) => {
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

      if (overContainer === NEW_GROUP) {
        console.log('over', {
          activeContainer,
          overContainer,
          activeIndex,
          newIndex,
          overIndex,
        });
        // return {
        //   ...prev,
        //   [activeContainer]: [
        //     ...prev[activeContainer].filter(
        //       (item) => item !== active.id
        //     ),
        //   ],
        //   // [`meld${Object.keys(items).length - 2}`]: [items[activeContainer][activeIndex]],
        // };
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

    const activeContainer = findContainer(id);
    const overContainer = findContainer(overId);

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer !== overContainer
    ) {
      return;
    }

    const activeIndex = items[activeContainer].indexOf(active.id);
    const overIndex = items[overContainer].indexOf(overId);

    if (overContainer === NEW_GROUP) {
      console.log('end', {
        overContainer,
        activeContainer,
        activeIndex,
        overIndex,
        items: items[overContainer],
      });
      setItems((items) => {
        return {
          ...items,
          [`meld${Object.keys(items).length + 1}`]: arrayMove(
            items[overContainer],
            activeIndex,
            overIndex
          ),
          [NEW_GROUP]: [],
        };
      });
      return;
    }
    console.log({ activeIndex, overIndex });
    if (activeIndex !== overIndex) {
      console.log('here!!!');
      setItems((items) => {
        return {
          ...items,
          [overContainer]: arrayMove(
            items[overContainer],
            activeIndex,
            overIndex
          ),
        };
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

export default Hand;
