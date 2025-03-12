package com.andi.rummy.dto;

import java.util.List;

import lombok.Data;

@Data
public class GameDto {
    private Integer id;
    private String status;
    private List<String> players;
    private int currentPlayerIndex;
    private String currentPlayerUsername;
}
