package com.andi.rummy.models;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Data;

@Entity
@Table(name = "games")
@Data
public class Game {
    public enum GameStatus {
        WAITING, PLAYING, FINISHED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private GameStatus status = GameStatus.WAITING;

    @ManyToMany
    @JoinTable(
      name = "game_players",
      joinColumns = @JoinColumn(name = "game_id"),
      inverseJoinColumns = @JoinColumn(name = "player_id")
    )
    private List<User> players = new ArrayList<>();

    @Column(nullable = false)
    private int currentPlayerIndex = 0;

    @Transient
    private Deck deck;

    @Transient
    private List<Card> discardPile = new ArrayList<>();

    public void startGame() {
        if (players.size() < 2) {
            throw new IllegalStateException("Need at least 2 players to start the game");
        }

        this.status = GameStatus.PLAYING;
        this.deck = new Deck();

        // Deal initial cards (7 per player in standard Rummy)
        int cardsPerPlayer = players.size() <= 4 ? 7 : 6;
        for (int i = 0; i < cardsPerPlayer; i++) {
            for (User player : players) {
                player.addCardToHand(deck.drawCard());
            }
        }

        // Add first card to discard pile
        discardPile.add(deck.drawCard());
    }

    public User getCurrentPlayer() {
        return players.get(currentPlayerIndex);
    }

    public void nextTurn() {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.size();
    }

    public Card getTopDiscard() {
        if (discardPile.isEmpty()) {
            return null;
        }
        return discardPile.get(discardPile.size() - 1);
    }

    public void discard(User player, Card card) {
        if (!player.removeCardFromHand(card)) {
            throw new IllegalArgumentException("Player does not have this card");
        }
        discardPile.add(card);
    }
}
