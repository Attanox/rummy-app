package com.andi.rummy.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class DotenvConfig {

  @Bean
  public Dotenv dotenv() {
    return Dotenv.configure().ignoreIfMissing().load();
  }

  @Bean
  public Dotenv setEnvironmentVariables(ConfigurableEnvironment environment, Dotenv dotenv) {
    Map<String, Object> envMap = new HashMap<>();

    // Add all dotenv entries to envMap
    dotenv.entries().forEach(e -> envMap.put(e.getKey(), e.getValue()));

    // Add the map to the Spring environment
    environment.getPropertySources().addFirst(new MapPropertySource("dotenvProperties", envMap));

    return dotenv;
  }
}