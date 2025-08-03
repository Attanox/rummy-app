import { Navigate, useParams } from 'react-router';
import { useGameSocket } from '../hooks/useGameSocket';
import Button from '../components/Button';
import PlayerView from '../components/PlayerView';
import { useEffect } from 'react';

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
  const {
    gameState,
    connected,
    startGame,
    drawFromDeck,
    discardCard,
    declareMeld,
  } = useGameSocket({
    gameId: Number(gameId),
  });

  console.log('gameState', gameState);

  useEffect(() => {
    setTimeout(() => {
      if (gameState?.yourTurn && gameState?.status === 'PLAYING') {
        drawFromDeck();
      }
    }, 500);
  }, [drawFromDeck, gameState?.yourTurn, gameState?.status]);

  if (!gameId) return <Navigate to={'/'} />;

  return (
    <div>
      <pre className="text-wrap">{JSON.stringify(gameState)}</pre>
      <br />
      <pre>{JSON.stringify(connected)}</pre>

      <pre className="w-96">{JSON.stringify(gameState)}</pre>
      <br />

      {gameState?.hand && (
        <PlayerView
          hand={gameState?.hand}
          melds={gameState.melds}
          topDiscard={gameState.topDiscard}
          discardCard={discardCard}
          declareMeld={declareMeld}
        />
      )}

      <StartGame startGame={startGame} />
    </div>
  );
};

export default GameRoomPage;
