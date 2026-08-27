package com.dev.gestorNF.infrastructure.security;


import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@SecurityScheme(name = SecurityConfig.SECURITY_SCHEME, type = SecuritySchemeType.HTTP, bearerFormat = "JWT", scheme = "bearer")

public class SecurityConfig {

        public static final String SECURITY_SCHEME = "bearerAuth";

        // Instâncias de JwtUtil e UserDetailsService injetadas pelo Spring
        private final JwtUtil jwtUtil;
        private final UserDetailsService userDetailsService;

        // Construtor para injeção de dependências de JwtUtil e UserDetailsService
        @Autowired
        public SecurityConfig(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
            this.jwtUtil = jwtUtil;
            this.userDetailsService = userDetailsService;
        }

        // Configuração do filtro de segurança
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            JwtRequestFilter jwtRequestFilter = new JwtRequestFilter(jwtUtil, userDetailsService);

            http
                    .csrf(AbstractHttpConfigurer::disable)
                    .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                    .authorizeHttpRequests(authorize -> authorize
                            .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                            .requestMatchers(HttpMethod.POST, "/usuario").permitAll()
                            .requestMatchers(HttpMethod.POST, "/usuario/login").permitAll()
                            .requestMatchers(HttpMethod.GET, "/usuario/endereco/**").permitAll()
                            .requestMatchers(HttpMethod.GET, "/usuario/verificar-email").permitAll()
                            .requestMatchers(HttpMethod.POST, "/usuario/esqueci-senha").permitAll()
                            .requestMatchers(HttpMethod.POST, "/usuario/redefinir-senha").permitAll()
                            .requestMatchers("/usuario/**").authenticated()
                            .anyRequest().authenticated()
                    )
                    .sessionManagement(session -> session
                            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                    )
                    .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

            return http.build();
        }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://192.168.100.4:3000",
                "https://gestornf.vercel.app"
        ));

        configuration.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        configuration.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

        // Configura o PasswordEncoder para criptografar senhas usando BCrypt
        @Bean
        public PasswordEncoder passwordEncoder() {
            return new BCryptPasswordEncoder(); // Retorna uma instância de BCryptPasswordEncoder
        }

        // Configura o AuthenticationManager usando AuthenticationConfiguration
        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
            // Obtém e retorna o AuthenticationManager da configuração de autenticação
            return authenticationConfiguration.getAuthenticationManager();
        }

    }
