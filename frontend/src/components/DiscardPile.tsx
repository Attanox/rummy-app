import { useDroppable } from '@dnd-kit/core';
import { TCard } from '../types';
import PlayingCard from './PlayingCard';

const DiscardPile = ({ topDiscard }: { topDiscard: TCard }) => {
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
            transform: 'rotate(-15deg)',
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
        <div
          style={{
            width: '70px',
            height: '100px',
            position: 'absolute',
            top: '0',
            left: '0',
          }}
        >
          {topDiscard && (
            <PlayingCard
              rank={topDiscard.rank!}
              suit={topDiscard.suit!}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscardPile;
