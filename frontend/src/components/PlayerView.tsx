import React, { useEffect } from 'react';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
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
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { IGameState } from '../hooks/useGameSocket';
import PlayingCard, { CardWrapper } from './PlayingCard';
import DiscardPile from './DiscardPile';
import CardGroup from './CardGroup';
import { TCard } from '../types';
import {
  clearEmptyMelds,
  getRank,
  getSuit,
  NEW_GROUP,
} from '../utils';
import DeclareMelds from './DeclareMelds';
import Droppable from './Droppable';

const getId = () => Math.random().toString(16).slice(2);

const getCardId = (c: TCard) => `${c.rank}-${c.suit}-${getId()}`;

const PlayerView = ({
  hand,
  melds,
  topDiscard,
  discardCard,
  declareMeld,
}: {
  hand: IGameState['hand'];
  melds: IGameState['melds'];
  topDiscard: IGameState['topDiscard'];
  discardCard: (suit: string, rank: string) => void;
  declareMeld: (cards: TCard[]) => void;
}) => {
  const [handCards, setHandCards] = React.useState<{
    [key: string]: Array<UniqueIdentifier>;
  }>({
    hand: hand?.map(getCardId) || [],
    [NEW_GROUP]: [],
  });
  const [playerMelds] = React.useState<
    Array<Array<UniqueIdentifier>>
  >(melds?.map((meld) => meld.map(getCardId)) || []);

  useEffect(() => {
    if (hand.length !== 15) return;
    const drawnCard = hand[hand.length - 1];
    setHandCards((items) => ({
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

  console.log('items', handCards);

  const clearDeclaredMelds = (ids: string[]): void => {
    setHandCards((prevItems) => {
      Object.keys(prevItems).forEach((itemKey) => {
        if (ids.includes(itemKey)) {
          delete prevItems[itemKey];
        }
      });
      return prevItems;
    });
  };

  return (
    <div className="flex flex-row">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col">
          <div className="w-100">
            {JSON.stringify(playerMelds)}
            {playerMelds.map((playerMeld, meldIndex) => {
              return (
                <div className="bg-gray-300 p-2.5 m-2.5 flex-1 flex flex-row">
                  <Droppable id={`meld-${meldIndex}-start`}>
                    <div className="w-[70px] h-[100px] border-2 border-solid"></div>
                  </Droppable>
                  {playerMeld.map((card) => {
                    return (
                      <CardWrapper card={card as string}>
                        {(rank, suit) => {
                          return (
                            <PlayingCard rank={rank} suit={suit} />
                          );
                        }}
                      </CardWrapper>
                    );
                  })}
                  <Droppable id={`meld-${meldIndex}-end`}>
                    <div className="w-[70px] h-[100px] border-2 border-solid"></div>
                  </Droppable>
                </div>
              );
            })}
          </div>

          <div className="w-24">
            <DeclareMelds
              declareMeld={declareMeld}
              clearDeclaredMelds={clearDeclaredMelds}
            />
          </div>

          <DiscardPile topDiscard={topDiscard} />
          <div className="flex flex-row w-100">
            {Object.keys(handCards).map((key) => (
              <CardGroup key={key} id={key} cards={handCards[key]} />
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
          </div>
        </div>
      </DndContext>
    </div>
  );

  function findContainer(id: UniqueIdentifier) {
    if (id in handCards) {
      return id;
    }

    return Object.keys(handCards).find((key) =>
      handCards[key].includes(id)
    );
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

    setHandCards((prev) => {
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
          handCards[activeContainer][activeIndex],
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
      setHandCards((items) => {
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
      setHandCards((items) => clearEmptyMelds({ ...items }));
      return;
    }

    const activeIndex = handCards[activeContainer].indexOf(active.id);
    const overIndex = handCards[overContainer].indexOf(overId);

    if (overContainer === NEW_GROUP) {
      setHandCards((items) => {
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
      setHandCards((items) => {
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

export default PlayerView;
