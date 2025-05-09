package com.andi.rummy.controllers;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.transaction.annotation.Transactional;

import com.andi.rummy.dto.DeclareMeldDto;
import com.andi.rummy.models.Card;
import com.andi.rummy.models.Game;
import com.andi.rummy.models.User;
import com.andi.rummy.services.GameService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@Tag(name = "GamesSocket", description = "Real-time Game management")
public class GameSocketController {

    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/game.join")
    @Operation(summary = "Join game")
    @Transactional
    public void joinGame(@Payload Map<String, Object> payload, Principal principal) {
      Long gameId = Long.valueOf(payload.get("gameId").toString());
      Game game = gameService.joinGame(gameId, principal.getName());

      // Notify all players in the game
      game.getPlayers().forEach(player -> {
        messagingTemplate.convertAndSendToUser(
            player.getUsername(),
            "/queue/game." + gameId,
            gameService.getGameState(gameId, player.getUsername()));
      });
    }

    @MessageMapping("/game.start")
    @Operation(summary = "Start game")
    @Transactional
    public void startGame(@Payload Map<String, Object> payload, Principal principal) {
        Long gameId = Long.valueOf(payload.get("gameId").toString());
        Game game = gameService.startGame(gameId, principal.getName());

        // Notify all players in the game
        game.getPlayers().forEach(player -> {
            messagingTemplate.convertAndSendToUser(
                player.getUsername(),
                "/queue/game." + gameId,
                gameService.getGameState(gameId, player.getUsername())
            );
        });
    }

    @MessageMapping("/game.drawFromDeck")
    @Operation(summary = "Draw from deck")
    @Transactional
    public void drawFromDeck(@Payload Map<String, Object> payload, Principal principal) {
        Long gameId = Long.valueOf(payload.get("gameId").toString());
        Game game = gameService.drawFromDeck(gameId, principal.getName());
        updateGameState(game);
    }

    @MessageMapping("/game.drawFromDiscard")
    @Operation(summary = "Draw from discard")
    @Transactional
    public void drawFromDiscard(@Payload Map<String, Object> payload, Principal principal) {
        Long gameId = Long.valueOf(payload.get("gameId").toString());
        Game game = gameService.drawFromDiscard(gameId, principal.getName());
        updateGameState(game);
    }

    @MessageMapping("/game.discard")
    @Operation(summary = "Discard a card")
    @Transactional
    public void discard(@Payload Map<String, Object> payload, Principal principal) {
        Long gameId = Long.valueOf(payload.get("gameId").toString());
        String suit = payload.get("suit").toString();
        String rank = payload.get("rank").toString();

        Card card = new Card(Card.Suit.valueOf(suit), Card.Rank.valueOf(rank));
        Game game = gameService.discard(gameId, principal.getName(), card);
        updateGameState(game);
    }

    @MessageMapping("/game.declareMeld")
    @Operation(summary = "Declare meld")
    @Transactional
    public void declareMeld(@Payload DeclareMeldDto payload, Principal principal) {
        Long gameId = payload.getGameId();
        List<Card> meldCards = payload.getMeldCards();

        Game game = gameService.declareMeld(gameId, principal.getName(), meldCards);
        updateGameState(game);
    }

    private void updateGameState(Game game) {
      // Send personalized game state to each player
      for (User player : game.getPlayers()) {
        messagingTemplate.convertAndSendToUser(
            player.getUsername(),
            "/queue/game." + game.getId(),
            gameService.getGameState(Long.valueOf(game.getId()), player.getUsername()));
      }
    }
}