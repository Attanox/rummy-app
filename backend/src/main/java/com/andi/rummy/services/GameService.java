package com.andi.rummy.services;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.andi.rummy.dto.GameDto;
import com.andi.rummy.dto.GameStateDto;
import com.andi.rummy.models.Card;
import com.andi.rummy.models.Deck;
import com.andi.rummy.models.Game;
import com.andi.rummy.models.User;
import com.andi.rummy.repositories.GameRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GameService {

  private final UserService userService;
  private final GameRepository gameRepository;

  private final Map<Long, Deck> gameDecks = new HashMap<>();
  private final Map<Long, List<Card>> gameDiscardPiles = new HashMap<>();
  private final Map<Long, Map<String, List<Card>>> playerHands = new HashMap<>();
  private final Map<Long, Map<String, List<List<Card>>>> playerMelds = new HashMap<>();

  private final Integer INITIAL_CARDS = 14;
  private final Integer MIN_PLAYERS = 2;


  @Transactional
  public Game createGame(String username) {
    User player = userService.getPlayerByUsername(username);

    Game game = new Game();
    game.setStatus(Game.GameStatus.WAITING);
    game.setPlayers(new ArrayList<>(Collections.singletonList(player)));

    return gameRepository.save(game);
  }

  @Transactional
  public List<GameDto> getAllGames() {
    List<Game> games = gameRepository.findByStatus(Game.GameStatus.WAITING);
    return games.stream()
        .map(this::convertToDto)
        .collect(Collectors.toList());
  }

  public GameDto convertToDto(Game game) {
    GameDto dto = new GameDto();
    dto.setId(game.getId());
    dto.setStatus(game.getStatus());
    dto.setPlayers(game.getPlayers().stream()
                    .map(User::getUsername)
                    .collect(Collectors.toList()));
    dto.setCurrentPlayerIndex(game.getCurrentPlayerIndex());
    dto.setCurrentPlayerUsername(
                    game.getPlayers().isEmpty() ? null :
                    game.getPlayers().get(game.getCurrentPlayerIndex()).getUsername()
    );

    return dto;
  }

  @Transactional
  public GameDto getGameDto(Long gameId, String username) {
    Game game = getGame(gameId);
    return convertToDto(game);
  }

  @Transactional
  public Game getGame(Long gameId) {
    return gameRepository.findById(gameId).orElseThrow(() -> new RuntimeException("Game not found with id: " + gameId));
  }

  @Transactional
  public Game joinGame(Long gameId, String username) {
    Game game = getGame(gameId);

    // if (game.getStatus() != Game.GameStatus.WAITING) {
    //   throw new RuntimeException("Cannot join a game that has already started");
    // }

    User player = userService.getPlayerByUsername(username);

    if (game.getPlayers().stream().noneMatch(p -> p.getUsername().equals(username))) {
      game.getPlayers().add(player);
      game = gameRepository.save(game);
    }

    return game;
  }

  @Transactional
  public Game startGame(Long gameId, String username) {
    Game game = getGame(gameId);

    if (!game.getPlayers().get(0).getUsername().equals(username)) {
      throw new RuntimeException("Only the game creator can start the game");
    }

    // if (game.getPlayers().size() < MIN_PLAYERS) {
    //   throw new RuntimeException("Need at least " + MIN_PLAYERS + " players to start the game");
    // }

    if (game.getStatus() != Game.GameStatus.WAITING) {
      throw new RuntimeException("Game has already started");
    }

    // Initialize deck
    Deck deck = new Deck();
    gameDecks.put(gameId, deck);

    // Initialize discard pile
    List<Card> discardPile = new ArrayList<>();
    gameDiscardPiles.put(gameId, discardPile);

    // Initialize player hands
    Map<String, List<Card>> hands = new HashMap<>();
    Map<String, List<List<Card>>> melds = new HashMap<>();

    for (User player : game.getPlayers()) {
      List<Card> hand = new ArrayList<>();
      for (int i = 0; i < INITIAL_CARDS; i++) {
        hand.add(deck.drawCard());
      }
      hands.put(player.getUsername(), hand);
      melds.put(player.getUsername(), new ArrayList<>());
    }

    playerHands.put(gameId, hands);
    playerMelds.put(gameId, melds);

    // Update game status
    game.setStatus(Game.GameStatus.PLAYING);
    game.setCurrentPlayerIndex(0);

    return gameRepository.save(game);
  }


  @Transactional
    public Game drawFromDeck(Long gameId, String username) {
        Game game = validatePlayerTurn(gameId, username);
        Deck deck = gameDecks.get(gameId);

        if (deck.isEmpty()) {
            // Reshuffle discard pile except top card
            List<Card> discardPile = gameDiscardPiles.get(gameId);
            Card topCard = discardPile.remove(discardPile.size() - 1);

            while (!discardPile.isEmpty()) {
                deck.getCards().add(discardPile.remove(0));
            }

            deck.shuffle();
            discardPile.add(topCard);
        }

        // Draw card for player
        Card drawnCard = deck.drawCard();
        playerHands.get(gameId).get(username).add(drawnCard);

        return game;
    }

    @Transactional
    public Game drawFromDiscard(Long gameId, String username) {
        Game game = validatePlayerTurn(gameId, username);
        List<Card> discardPile = gameDiscardPiles.get(gameId);

        if (discardPile.isEmpty()) {
            throw new RuntimeException("Discard pile is empty");
        }

        // Draw top card from discard pile
        Card drawnCard = discardPile.remove(discardPile.size() - 1);
        playerHands.get(gameId).get(username).add(drawnCard);

        return game;
    }

    @Transactional
    public Game discard(Long gameId, String username, Card card) {
        Game game = validatePlayerTurn(gameId, username);
        List<Card> playerHand = playerHands.get(gameId).get(username);

        // Find and remove the card from player's hand
        boolean removed = false;
        for (Iterator<Card> iterator = playerHand.iterator(); iterator.hasNext();) {
            Card handCard = iterator.next();
            if (handCard.getSuit() == card.getSuit() && handCard.getRank() == card.getRank()) {
                iterator.remove();
                removed = true;
                break;
            }
        }

        if (!removed) {
            throw new RuntimeException("Card not found in player's hand");
        }

        // Add card to discard pile
        gameDiscardPiles.get(gameId).add(card);

        // Check if player has won
        if (playerHand.isEmpty()) {
            game.setStatus(Game.GameStatus.FINISHED);
            return gameRepository.save(game);
        }

        // Move to next player
        game.setCurrentPlayerIndex((game.getCurrentPlayerIndex() + 1) % game.getPlayers().size());
        return gameRepository.save(game);
    }

    @Transactional
    public Game declareMeld(Long gameId, String username, List<Card> meldCards) {
        Game game = validatePlayerTurn(gameId, username);
        List<Card> playerHand = playerHands.get(gameId).get(username);
        List<List<Card>> playerMeldsList = playerMelds.get(gameId).get(username);

        // Validate meld (should be a run or a set)
        if (!isValidMeld(meldCards)) {
            throw new RuntimeException("Invalid meld");
        }

        // Remove cards from hand
        for (Card meldCard : meldCards) {
            boolean removed = false;
            for (Iterator<Card> iterator = playerHand.iterator(); iterator.hasNext();) {
                Card handCard = iterator.next();
                if (handCard.getSuit() == meldCard.getSuit() && handCard.getRank() == meldCard.getRank()) {
                    iterator.remove();
                    removed = true;
                    break;
                }
            }

            if (!removed) {
                throw new RuntimeException("Card not found in player's hand");
            }
        }

        // Add meld to player's melds
        playerMeldsList.add(meldCards);

        return game;
    }

    private boolean isValidMeld(List<Card> cards) {
        if (cards.size() < 3) {
            return false;
        }

        // Check if it's a set (same rank)
        boolean isSet = cards.stream()
                .map(Card::getRank)
                .distinct()
                .count() == 1;

        if (isSet) {
            // Ensure all suits are different
            return cards.stream()
                    .map(Card::getSuit)
                    .distinct()
                    .count() == cards.size();
        }

        // Check if it's a run (same suit, consecutive ranks)
        boolean isSameSuit = cards.stream()
                .map(Card::getSuit)
                .distinct()
                .count() == 1;

        if (!isSameSuit) {
            return false;
        }

        // Sort by rank
        List<Card> sortedCards = cards.stream()
                .sorted(Comparator.comparing(card -> card.getRank().ordinal()))
                .collect(Collectors.toList());

        // Check if ranks are consecutive
        for (int i = 0; i < sortedCards.size() - 1; i++) {
            if (sortedCards.get(i + 1).getRank().ordinal() - sortedCards.get(i).getRank().ordinal() != 1) {
                return false;
            }
        }

        return true;
    }

    private Game validatePlayerTurn(Long gameId, String username) {
        Game game = gameRepository.findByIdAndPlayerUsername(gameId, username)
                .orElseThrow(() -> new RuntimeException("Game not found or player not in game"));

        if (game.getStatus() != Game.GameStatus.PLAYING) {
            throw new RuntimeException("Game is not in progress");
        }

        User currentPlayer = game.getPlayers().get(game.getCurrentPlayerIndex());
        if (!currentPlayer.getUsername().equals(username)) {
            throw new RuntimeException("Not your turn");
        }

        return game;
    }


    public GameStateDto getGameState(Long gameId, String username) {
        Game game = gameRepository.findByIdAndPlayerUsername(gameId, username)
                .orElseThrow(() -> new RuntimeException("Game not found or player not in game"));

        GameStateDto state = new GameStateDto();
        state.setGameId(gameId);
        state.setStatus(game.getStatus().toString());
        state.setCurrentPlayerUsername(
                game.getPlayers().isEmpty() ? null :
                game.getPlayers().get(game.getCurrentPlayerIndex()).getUsername()
        );
        state.setYourTurn(
                game.getStatus() == Game.GameStatus.PLAYING &&
                game.getPlayers().get(game.getCurrentPlayerIndex()).getUsername().equals(username)
        );

        // Add player-specific information
        if (game.getStatus() == Game.GameStatus.PLAYING) {
            state.setHand(playerHands.get(gameId).get(username));
            state.setMelds(playerMelds.get(gameId).get(username));

            // Add information about other players
            Map<String, Integer> playerCardCounts = new HashMap<>();
            for (User player : game.getPlayers()) {
                if (!player.getUsername().equals(username)) {
                    playerCardCounts.put(
                        player.getUsername(),
                        playerHands.get(gameId).get(player.getUsername()).size()
                    );
                }
            }
            state.setPlayerCardCounts(playerCardCounts);

            // Add discard pile top card
            List<Card> discardPile = gameDiscardPiles.get(gameId);
            if (!discardPile.isEmpty()) {
                state.setTopDiscard(discardPile.get(discardPile.size() - 1));
            }

            // Add deck size
            state.setDeckSize(gameDecks.get(gameId).size());
        }

        return state;
    }
}
