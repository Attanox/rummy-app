import React from 'react';
import { AnimateLayoutChanges, defaultAnimateLayoutChanges, useSortable } from '@dnd-kit/sortable';

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

const Draggable = ({
  id,
  data,
  children,
}: React.PropsWithChildren<{ id: string; data?: never }>) => {
  // const { attributes, listeners, setNodeRef, transform } =
  //   useDraggable({
  //     id,
  //     data,
  //   });
  const { attributes, listeners, setNodeRef, transform } =
    useSortable({
      id,
      data,
      animateLayoutChanges,
    });
  console.log('transform', transform)
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 3,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
};

export default Draggable;
