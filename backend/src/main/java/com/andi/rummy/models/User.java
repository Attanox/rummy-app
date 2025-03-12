package com.andi.rummy.models;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Builder
@Table(name = "users")
public class User implements UserDetails {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  private String password;
  @Column(unique = true)
  private String username;


  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    Set<SimpleGrantedAuthority> authorities = new HashSet<>();
    return authorities;
  }

  @Override
  public String getPassword() {
    return this.password;
  }

  @Override
  public String getUsername() {
    return this.username;
  }

  @Transient
  @Builder.Default
  private List<Card> hand = new ArrayList<>();

  @Transient
  @Builder.Default
  private List<List<Card>> melds = new ArrayList<>();

  public void addCardToHand(Card card) {
    hand.add(card);
    // Sort hand by suit and rank for easier play
    hand = hand.stream()
            .sorted(Comparator.comparing(Card::getSuit)
                    .thenComparing(Card::getRank))
            .collect(Collectors.toList());
  }

  public boolean removeCardFromHand(Card card) {
    return hand.remove(card);
  }

  public int calculateScore() {
    return hand.stream().mapToInt(Card::getValue).sum();
  }

}
