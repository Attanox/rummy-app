import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import React from 'react';
import { useGameStore } from '../store/gameStore';

const DnDWrapper = (props: React.PropsWithChildren<object>) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { moveCardWithinGroup, moveCardBetweenGroups } =
    useGameStore();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) return;

    const activeGroupIndex = active.data.current.sortable.containerId;
    const overGroupIndex = over.data.current.sortable.containerId;
    console.log({
      activeGroupIndex,
      overGroupIndex,
      active,
      over,
    });

    if (activeGroupIndex === overGroupIndex) {
      // Move within the same group
      const oldIndex = active.data.current.sortable.index;
      const newIndex = over.data.current.sortable.index;

      moveCardWithinGroup(activeGroupIndex, oldIndex, newIndex);
    } else {
      // Move between different groups
      const cardIndex = active.data.current.sortable.index;
      moveCardBetweenGroups(
        activeGroupIndex,
        overGroupIndex,
        cardIndex
      );
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
    >
      {props.children}
    </DndContext>
  );
};

export default DnDWrapper;
