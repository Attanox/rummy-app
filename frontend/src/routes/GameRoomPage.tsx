import { Navigate, useParams } from 'react-router';
import { useGameSocket } from '../hooks/useGameSocket';
import Button from '../components/Button';

const StartGame = ({ startGame }: { startGame: () => void }) => {
  const handleJoin = async () => {
    try {
      startGame();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Button onClick={handleJoin} variant="btn-secondary">
      Start Game
    </Button>
  );
};

const GameRoomPage = () => {
  const { gameId } = useParams();
  const { gameState, connected, startGame } = useGameSocket({
    gameId: Number(gameId),
  });

  if (!gameId) return <Navigate to={'/'} />;

  return (
    <div>
      <pre>{JSON.stringify(gameState)}</pre>
      <br />
      <pre>{JSON.stringify(connected)}</pre>
      <StartGame startGame={startGame} />
    </div>
  );
};

export default GameRoomPage;
