import { Fragment } from 'react';
import { components } from '../api/schema';
import { getRank, getSuit } from '../utils';

type TCard = components['schemas']['Card'];

type TRank = NonNullable<TCard['rank']>;
type TSuit = NonNullable<TCard['suit']>;

const PlayingCard = ({
  rank,
  suit,
}: {
  rank: TRank;
  suit: TSuit;
}) => {
  const suitSymbols: {
    [key in TSuit]: string;
  } = {
    HEARTS: '♥',
    DIAMONDS: '♦',
    CLUBS: '♣',
    SPADES: '♠',
  };

  const styles: Record<string, React.CSSProperties> = {
    card: {
      width: '70px',
      height: '100px',
      border: '1px solid #333',
      borderRadius: '8px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '5px',
      fontFamily: 'Arial, sans-serif',
      cursor: 'grab',
      color:
        suit === 'HEARTS' || suit === 'DIAMONDS' ? '#d32f2f' : '#000',
      marginRight: '-15px',
    },
    rank: {
      fontSize: '16px',
      fontWeight: 'bold',
    },
    suit: {
      fontSize: '14px',
    },
    bottomRank: {
      fontSize: '16px',
      fontWeight: 'bold',
      transform: 'rotate(180deg)',
    },
    joker: {
      fontSize: '16px', // Reduced font size to fit within the card
      fontWeight: 'bold',
      writingMode: 'vertical-rl',
      textOrientation: 'upright',
      letterSpacing: '1px', // Adjusted spacing for better fit
      lineHeight: '1', // Adjusted line height to fit within the card
      whiteSpace: 'nowrap', // Prevents wrapping and keeps text within bounds
      overflow: 'hidden', // Ensures text does not overflow
    },
  };

  return (
    <div style={styles.card}>
      <div style={styles.rank}>{rank}</div>
      <div style={styles.suit}>{suitSymbols[suit]}</div>
      <div style={styles.bottomRank}>{rank}</div>
    </div>
  );
};

export const CardWrapper = ({
  card,
  children,
}: {
  card: string;
  children: (rank: TRank, suit: TSuit) => React.ReactNode;
}) => {
  const rank = getRank(card);
  const suit = getSuit(card);

  return <Fragment>{children(rank, suit)}</Fragment>;
};

export default PlayingCard;
