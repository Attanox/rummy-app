CREATE TABLE games (
  id SERIAL PRIMARY KEY,
  status VARCHAR(20) NOT NULL,
  current_player_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE game_players (
  game_id BIGINT NOT NULL,
  player_id BIGINT NOT NULL,
  PRIMARY KEY (game_id, player_id),
  FOREIGN KEY (game_id) REFERENCES games (id),
  FOREIGN KEY (player_id) REFERENCES users (id)
);