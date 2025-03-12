package com.andi.rummy.controllers;

import java.security.Principal;
import java.util.Map;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.andi.rummy.models.Card;
import com.andi.rummy.models.Game;
import com.andi.rummy.models.User;
import com.andi.rummy.services.GameService;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class GameSocketController {

    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/game.join")
    public void joinGame(@Payload Map<String, Object> payload, Principal principal) {
        Long gameId = Long.valueOf(payload.get("gameId").toString());
        Game game = gameService.joinGame(gameId, principal.getName());

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
    public void drawFromDeck(@Payload Map<String, Object> payload, Principal principal) {
        Long gameId = Long.valueOf(payload.get("gameId").toString());
        Game game = gameService.drawFromDeck(gameId, principal.getName());
        updateGameState(game);
    }

    @MessageMapping("/game.drawFromDiscard")
    public void drawFromDiscard(@Payload Map<String, Object> payload, Principal principal) {
        Long gameId = Long.valueOf(payload.get("gameId").toString());
        Game game = gameService.drawFromDiscard(gameId, principal.getName());
        updateGameState(game);
    }

    @MessageMapping("/game.discard")
    public void discard(@Payload Map<String, Object> payload, Principal principal) {
        Long gameId = Long.valueOf(payload.get("gameId").toString());
        String suit = payload.get("suit").toString();
        String rank = payload.get("rank").toString();

        Card card = new Card(Card.Suit.valueOf(suit), Card.Rank.valueOf(rank));
        Game game = gameService.discard(gameId, principal.getName(), card);
        updateGameState(game);
    }

    @MessageMapping("/game.declareMeld")
    public void declareMeld(@Payload Map<String, Object> payload, Principal principal) {
        Long gameId = Long.valueOf(payload.get("gameId").toString());
        // Process card indices from payload to form a meld
        // ...

        Game game = gameService.declareMeld(gameId, principal.getName(), null);
        updateGameState(game);
    }

    private void updateGameState(Game game) {
        // Send personalized game state to each player
        for (User player : game.getPlayers()) {
            messagingTemplate.convertAndSendToUser(
                player.getUsername(),
                "/queue/game." + game.getId(),
                gameService.getGameState(Long.valueOf(game.getId()), player.getUsername())
            );
        }
    }
}