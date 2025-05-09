package com.andi.rummy.dto;

import java.util.List;

import com.andi.rummy.models.Card;

import lombok.Data;

@Data
public class DeclareMeldDto {
  private Long gameId;
  private List<Card> meldCards;
}
