package com.andi.rummy.dto;

import com.andi.rummy.models.User;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TokenResponse {
  private String token;
  private User user;
}
