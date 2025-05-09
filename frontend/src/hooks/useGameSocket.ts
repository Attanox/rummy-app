import { useEffect, useRef, useState, useCallback } from 'react';
import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import type { components } from '../api/schema';

interface UseGameSocketProps {
  gameId: number;
}

type TStatus = components['schemas']['GameDto']['status'];
type TCard = components['schemas']['Card'];

export interface IGameState {
  gameId: number;
  status: TStatus;
  currentPlayerUsername: string;
  yourTurn: boolean;
  hand: Array<TCard>;
  melds: Array<Array<TCard>>;
  playerCardCounts: Record<string, number>;
  topDiscard: TCard;
  deckSize: number;
}

export const useGameSocket = ({ gameId }: UseGameSocketProps) => {
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<IGameState | null>(null);
  const stompClient = useRef<Client | null>(null);

  const token = localStorage.getItem('auth_token');

  const startGame = useCallback(() => {
    if (!stompClient.current || !connected) return;

    stompClient.current.publish({
      destination: '/app/game.start',
      body: JSON.stringify({ gameId }),
    });
  }, [gameId, connected]);

  const drawFromDeck = useCallback(() => {
    console.log('publishing, drawing card', stompClient, connected);
    if (!stompClient.current || !connected) return;
    stompClient.current.publish({
      destination: '/app/game.drawFromDeck',
      body: JSON.stringify({ gameId }),
    });
  }, [gameId, connected]);

  const drawFromDiscard = useCallback(() => {
    if (!stompClient.current || !connected) return;

    stompClient.current.publish({
      destination: '/app/game.drawFromDiscard',
      body: JSON.stringify({ gameId }),
    });
  }, [gameId, connected]);

  const discardCard = useCallback(
    (suit: string, rank: string) => {
      if (!stompClient.current || !connected) return;

      stompClient.current.publish({
        destination: '/app/game.discard',
        body: JSON.stringify({ gameId, suit, rank }),
      });
    },
    [gameId, connected]
  );

  const declareMeld = useCallback(
    (meldCards: TCard[]) => {
      if (!stompClient.current || !connected) return;

      stompClient.current.publish({
        destination: '/app/game.declareMeld',
        body: JSON.stringify({ gameId, meldCards }),
      });
    },
    [gameId, connected]
  );

  useEffect(() => {
    if (!gameId || !token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('/ws'),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      setConnected(true);

      // Subscribe to personal game updates
      client.subscribe(
        `/user/queue/game.${gameId}`,
        (message: IMessage) => {
          const gameState = JSON.parse(message.body);
          setGameState(gameState);
        }
      );

      // Join the game
      client.publish({
        destination: '/app/game.join',
        body: JSON.stringify({ gameId }),
      });
    };

    client.onDisconnect = () => {
      setConnected(false);
    };

    client.activate();
    stompClient.current = client;

    return () => {
      client.deactivate();
    };
  }, [gameId, token]);

  return {
    connected,
    gameState,
    startGame,
    drawFromDeck,
    drawFromDiscard,
    discardCard,
    declareMeld,
  };
};
