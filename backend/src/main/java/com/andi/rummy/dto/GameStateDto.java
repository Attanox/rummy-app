package com.andi.rummy.dto;

import java.util.List;
import java.util.Map;

import com.andi.rummy.models.Card;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "GameState", description = "Game State")
public class GameStateDto {
  private Long gameId;
  private String status;
  private String currentPlayerUsername;
  private boolean yourTurn;
  private List<Card> hand;
  private List<List<Card>> melds;
  private Map<String, Integer> playerCardCounts;
  private Card topDiscard;
  private int deckSize;
}
