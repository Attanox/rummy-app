package com.andi.rummy.models;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import lombok.Data;

@Data
public class Deck {
    private List<Card> cards;

    public Deck() {
      this.cards = new ArrayList<>();
        for (int i = 0; i < 2; i++) {
          for (Card.Suit suit : Card.Suit.values()) {
              for (Card.Rank rank : Card.Rank.values()) {
                  cards.add(new Card(suit, rank));
              }
          }
        }
        // shuffle();
    }

    public void shuffle() {
        Collections.shuffle(cards);
    }

    public Card drawCard() {
        if (cards.isEmpty()) {
            throw new IllegalStateException("Cannot draw from an empty deck");
        }
        return cards.remove(cards.size() - 1);
    }

    public boolean isEmpty() {
        return cards.isEmpty();
    }

    public int size() {
        return cards.size();
    }
}
