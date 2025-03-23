package com.andi.rummy.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.andi.rummy.security.JwtTokenProvider;
import com.andi.rummy.services.UserService;

import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

  @Value("${app.cors.allowed-origins}")
  private String allowedOrigin;

  private final JwtTokenProvider tokenProvider;
  private final UserService userService;

  @Override
  public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
    // Register the "/ws" endpoint, enabling SockJS fallback options
    registry.addEndpoint("/ws")
        .setAllowedOrigins(allowedOrigin)

        .withSockJS();

    registry.addEndpoint("/ws").setAllowedOrigins(allowedOrigin);
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

  @Override
    public void configureClientInboundChannel(@SuppressWarnings("null") ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @SuppressWarnings("null")
            @Override
            public Message<?> preSend(@SuppressWarnings("null") Message<?> message, @SuppressWarnings("null") MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);


                assert accessor != null;
                if (StompCommand.CONNECT.equals(accessor.getCommand())) {

                    String authorizationHeader = accessor.getFirstNativeHeader("Authorization");
                    assert authorizationHeader != null;
                    @SuppressWarnings("null")
                    String token = authorizationHeader.substring(7);

                    String username = tokenProvider.getUsernameFromToken(token);
                    UserDetails userDetails = userService.loadUserByUsername(username);
                    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);

                    accessor.setUser(usernamePasswordAuthenticationToken);
                }

                return message;
            }

        });
    }
}
