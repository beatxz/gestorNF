package com.dev.gestorNF.infrastructure.security;

import com.dev.gestorNF.infrastructure.exception.dto.ErrorResponseDTO;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.filter.OncePerRequestFilter;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.time.LocalDateTime;

public class JwtRequestFilter extends OncePerRequestFilter {

    // Define propriedades para armazenar instâncias de JwtUtil e
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    // Construtor que inicializa as propriedades com instâncias fornecidas
    public JwtRequestFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    // Método chamado uma vez por requisição para processar o filtro
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain
    ) throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");


        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {

            try {

                final String token = authorizationHeader.substring(7);

                final String username = jwtUtil.extrairEmailToken(token);

                if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    if (jwtUtil.validateToken(token, username)) {

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }

            } catch (ExpiredJwtException e) {

                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

                response.setContentType("application/json");

                response.setCharacterEncoding("UTF-8");

                response.getWriter().write(
                        buildError(HttpStatus.UNAUTHORIZED.value(), "Token expirado", request.getRequestURI(), null));

                return;

            } catch (Exception e) {

                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

                response.setContentType("application/json");

                response.setCharacterEncoding("UTF-8");

                response.getWriter().write(
                        buildError(HttpStatus.UNAUTHORIZED.value(), "Token inválido", request.getRequestURI(), null));

                return;
            }
        }

        chain.doFilter(request, response);
    }
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        String path = request.getServletPath();
        String method = request.getMethod();

        return (path.equals("/usuario") && method.equalsIgnoreCase("POST"))
                || path.equals("/usuario/login")
                || path.equals("/usuario/esqueci-senha")
                || path.equals("/usuario/redefinir-senha")
                || path.equals("/usuario/verificar-email");
    }
    private void escreverErro(HttpServletResponse response, HttpServletRequest request, String mensagem
    ) throws IOException {

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        response.setContentType("application/json");

        response.setCharacterEncoding("UTF-8");

        response.getWriter().write(
                buildError(
                        HttpStatus.UNAUTHORIZED.value(),
                        mensagem,
                        request.getRequestURI(),
                        null
                )
        );
    }

    private String buildError(int status, String mensagem, String path,String error){
        ErrorResponseDTO errorResponseDTO = ErrorResponseDTO.builder()
                .timestamp(LocalDateTime.now())
                .menssage(mensagem)
                .status(status)
                .error(error)
                .path(path)
                .build();

       ObjectMapper objectMapper = new ObjectMapper();
            return objectMapper.writeValueAsString(errorResponseDTO);

    }
}
