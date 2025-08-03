import { useGameStore } from '../store/gameStore';
import { TCard } from '../types';
import Button from './Button';

function sumAllMeldValues(melds: Record<string, TCard[]>): number {
  return Object.values(melds)
    .flat()
    .reduce((sum, { value }) => sum + (value || 0), 0);
}

const DeclareMelds = ({
  declareMeld,
  clearDeclaredMelds,
}: {
  declareMeld: (cards: TCard[]) => void;
  clearDeclaredMelds: (ids: string[]) => void;
}) => {
  const { declaring } = useGameStore();
  const meldValues = sumAllMeldValues(declaring);

  const handleDeclaring = () => {
    clearDeclaredMelds(Object.keys(declaring));
    Object.keys(declaring).forEach((declaringKey) => {
      declareMeld(declaring[declaringKey]);
    });
  };

  return (
    <Button
      disabled={meldValues < 51}
      variant="btn-secondary"
      onClick={handleDeclaring}
    >
      Declare melds {meldValues}
    </Button>
  );
};

export default DeclareMelds;
