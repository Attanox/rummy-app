package com.andi.rummy.controllers;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.andi.rummy.dto.GameDto;
import com.andi.rummy.models.Game;
import com.andi.rummy.services.GameService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/games")
@RequiredArgsConstructor
@Tag(name = "Games", description = "Game management API")
@SecurityRequirement(name = "bearerAuth")
public class GameController {

    private final GameService gameService;

    @GetMapping
    @Operation(summary = "Get all available games")
    public ResponseEntity<List<GameDto>> getAllGames() {
      return ResponseEntity.ok(gameService.getAllGames());
    }

    @PostMapping
    @Operation(summary = "Create a new game")
    public ResponseEntity<GameDto> createGame(Principal principal) {
      Game game = gameService.createGame(principal.getName());
      return ResponseEntity.ok(gameService.convertToDto(game));
    }

    @PostMapping("/{id}/join")
    @Operation(summary = "Join game by id")
    public ResponseEntity<GameDto> getGame(@PathVariable Long id, Principal principal) {
      Game game = gameService.joinGame(id, principal.getName());
      return ResponseEntity.ok(gameService.convertToDto(game));
    }

    @PostMapping("/{id}/start")
    @Operation(summary = "Start a game")
    public ResponseEntity<GameDto> startGame(@PathVariable Long id, Principal principal) {
      Game game = gameService.startGame(id, principal.getName());
      return ResponseEntity.ok(gameService.convertToDto(game));
    }
}
