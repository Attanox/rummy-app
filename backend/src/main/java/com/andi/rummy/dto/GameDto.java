package com.andi.rummy.dto;

import java.util.List;

import com.andi.rummy.models.Game.GameStatus;

import lombok.Data;

@Data
public class GameDto {
    private Integer id;
    private GameStatus status;
    private List<String> players;
    private int currentPlayerIndex;
    private String currentPlayerUsername;
}
