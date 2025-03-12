package com.andi.rummy.repositories;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.andi.rummy.models.User;


public interface UserRepository extends JpaRepository<User, Integer> {

  Optional<User> findByUsername(String username);

}
