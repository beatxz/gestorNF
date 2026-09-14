package com.dev.gestorNF.infrastructure.security;

import com.dev.gestorNF.infrastructure.entity.out.AssinaturaEntity;
import com.dev.gestorNF.infrastructure.entity.out.AssinaturaStatus;
import com.dev.gestorNF.infrastructure.entity.out.UsuarioEntity;
import com.dev.gestorNF.infrastructure.entity.out.UsuarioRole;
import com.dev.gestorNF.infrastructure.repository.AssinaturaRepository;
import com.dev.gestorNF.infrastructure.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;

@RequiredArgsConstructor
public class AssinaturaAccessFilter
        extends OncePerRequestFilter {

    private final UsuarioRepository usuarioRepository;
    private final AssinaturaRepository assinaturaRepository;



    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain
    ) throws ServletException, IOException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (
                authentication == null || !authentication.isAuthenticated()) {

            chain.doFilter(request, response);
            return;
        }


        String email = authentication.getName();

        Optional<UsuarioEntity> usuarioOptional = usuarioRepository.findByEmail(email);

        if (usuarioOptional.isEmpty()) {

            chain.doFilter(request, response);

            return;
        }


        UsuarioEntity usuario = usuarioOptional.get();



        if (
                usuario.getRole() == UsuarioRole.ADMIN) {

            chain.doFilter(request, response);

            return;
        }


        Optional<AssinaturaEntity> assinaturaOptional =
                assinaturaRepository.findByUsuarioId(usuario.getId());



        if (assinaturaOptional.isEmpty()) {

            chain.doFilter(request, response);

            return;
        }


        AssinaturaEntity assinatura = assinaturaOptional.get();



        if (
                assinatura.getStatus() == AssinaturaStatus.ATIVO) {

            chain.doFilter(request, response);

            return;
        }


        if (
                assinatura.getStatus() == AssinaturaStatus.EM_TESTE) {

            LocalDateTime fimTeste = assinatura.getFimTeste();

            if (fimTeste != null &&
                            fimTeste.isAfter(LocalDateTime.now())) {

                chain.doFilter(request, response);
                return;
            }


            escreverBloqueio(response, "Seu período de teste terminou.");

            return;
        }



        if (assinatura.getStatus() == AssinaturaStatus.SUSPENSO) {

            escreverBloqueio(response, "Seu acesso está suspenso. Entre em contato com o suporte.");
            return;
        }



        if (assinatura.getStatus() == AssinaturaStatus.CANCELADO) {

            escreverBloqueio(response, "Sua assinatura está cancelada.");

            return;
        }


        escreverBloqueio(response, "Não foi possível validar o acesso à assinatura.");
    }



    private void escreverBloqueio(HttpServletResponse response, String mensagem
    ) throws IOException {

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);

        response.setContentType("application/json");

        response.setCharacterEncoding("UTF-8");

        String mensagemSegura = mensagem
                        .replace("\\", "\\\\")
                        .replace("\"", "\\\"");

        response.getWriter().write(
                """
                {
                  "message": "%s"
                }
                """.formatted(
                        mensagemSegura
                )
        );
    }



    @Override
    protected boolean shouldNotFilter(
            HttpServletRequest request) {

        String path = request.getServletPath();

        return path.startsWith("/admin/") || path.equals("/usuario/me")
                || path.equals("/usuario/login")
                || path.equals("/usuario/esqueci-senha")
                || path.equals("/usuario/redefinir-senha")
                || path.equals("/usuario/verificar-email")
                || path.equals("/convites/validar")
                || path.equals("/convites/aceitar")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/swagger-ui");
    }
}