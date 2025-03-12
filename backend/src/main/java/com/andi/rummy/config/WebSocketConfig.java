package com.andi.rummy.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  @Value("${app.cors.allowed-origins}:http://localhost:5173")
  private String allowedOrigin;

  @Override
  public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
    // Register the "/ws" endpoint, enabling SockJS fallback options
    registry.addEndpoint("/ws")
            .setAllowedOrigins(allowedOrigin)
            .withSockJS();
  }

  @Override
  public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
    // Set prefix for messages FROM server TO client
    registry.enableSimpleBroker("/topic", "/queue");

    // Set prefix for messages FROM client TO server
    registry.setApplicationDestinationPrefixes("/app");

    // Set user destination prefix for private messages
    registry.setUserDestinationPrefix("/user");
  }
}
