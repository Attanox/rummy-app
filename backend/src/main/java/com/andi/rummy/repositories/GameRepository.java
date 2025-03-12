package com.andi.rummy.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.andi.rummy.models.Game;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {
    List<Game> findByStatus(Game.GameStatus status);

    @Query("SELECT g FROM Game g JOIN g.players p WHERE p.username = :username")
    List<Game> findByPlayerUsername(@Param("username") String username);

    @Query("SELECT g FROM Game g JOIN g.players p WHERE g.id = :gameId AND p.username = :username")
    Optional<Game> findByIdAndPlayerUsername(@Param("gameId") Long gameId, @Param("username") String username);
}
