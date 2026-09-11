package com.dev.gestorNF.business;

import com.dev.gestorNF.business.dto.in.AceitarConviteDTORequest;
import com.dev.gestorNF.business.dto.in.ConviteDTORequest;
import com.dev.gestorNF.business.dto.out.ConviteDTOResponse;
import com.dev.gestorNF.business.dto.out.ConvitePublicoDTOResponse;
import com.dev.gestorNF.infrastructure.entity.out.ConviteEntity;
import com.dev.gestorNF.infrastructure.entity.out.ConviteStatus;
import com.dev.gestorNF.infrastructure.entity.out.UsuarioEntity;
import com.dev.gestorNF.infrastructure.entity.out.UsuarioRole;
import com.dev.gestorNF.infrastructure.exception.ConflictException;
import com.dev.gestorNF.infrastructure.repository.ConviteRepository;
import com.dev.gestorNF.infrastructure.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ConviteService {

    private static final String VERSAO_TERMOS = "2026-09-10";
    private static final String VERSAO_POLITICA_PRIVACIDADE = "2026-09-10";

    private final ConviteRepository conviteRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Transactional
    public ConviteDTOResponse criarConvite(ConviteDTORequest request) {

        String email = normalizarEmail(request.getEmail());

        if (usuarioRepository.existsByEmail(email)) {
            throw new ConflictException(
                    "Já existe uma conta cadastrada com esse e-mail"
            );
        }

        LocalDateTime agora = LocalDateTime.now();

        conviteRepository
                .findByEmailAndStatus(email, ConviteStatus.PENDENTE)
                .ifPresent(conviteExistente -> {

                    if (conviteExistente.getExpiraEm().isAfter(agora)) {
                        throw new ConflictException(
                                "Já existe um convite pendente para esse e-mail"
                        );
                    }

                    conviteExistente.setStatus(ConviteStatus.EXPIRADO);

                    conviteRepository.save(conviteExistente);
                });

        ConviteEntity convite = ConviteEntity.builder()
                .email(email)
                .token(UUID.randomUUID().toString())
                .criadoEm(agora)
                .expiraEm(agora.plusHours(24))
                .status(ConviteStatus.PENDENTE)
                .build();

        ConviteEntity conviteSalvo =
                conviteRepository.save(convite);

        emailService.enviarEmailConvite(
                conviteSalvo.getEmail(),
                conviteSalvo.getToken()
        );

        return paraResponse(conviteSalvo);
    }

    @Transactional
    public List<ConviteDTOResponse> listarConvites() {

        LocalDateTime agora = LocalDateTime.now();

        List<ConviteEntity> convites =
                conviteRepository.findAllByOrderByCriadoEmDesc();

        for (ConviteEntity convite : convites) {

            if (convite.getStatus() == ConviteStatus.PENDENTE
                    && convite.getExpiraEm().isBefore(agora)) {

                convite.setStatus(ConviteStatus.EXPIRADO);
            }
        }

        conviteRepository.saveAll(convites);

        return convites.stream()
                .map(this::paraResponse)
                .toList();
    }

    @Transactional
    public void cancelarConvite(Long id) {

        ConviteEntity convite = conviteRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Convite não encontrado")
                );

        atualizarStatusSeExpirado(convite);

        if (convite.getStatus() == ConviteStatus.ACEITO) {
            throw new ConflictException(
                    "Um convite já aceito não pode ser cancelado"
            );
        }

        if (convite.getStatus() == ConviteStatus.CANCELADO) {
            throw new ConflictException(
                    "Este convite já foi cancelado"
            );
        }

        if (convite.getStatus() == ConviteStatus.EXPIRADO) {
            throw new ConflictException(
                    "Este convite já expirou"
            );
        }

        convite.setStatus(ConviteStatus.CANCELADO);

        conviteRepository.save(convite);
    }

    @Transactional
    public ConvitePublicoDTOResponse validarConvite(String token) {

        ConviteEntity convite = buscarConviteValido(token);

        return ConvitePublicoDTOResponse.builder()
                .email(convite.getEmail())
                .expiraEm(convite.getExpiraEm())
                .build();
    }

    @Transactional
    public void aceitarConvite(AceitarConviteDTORequest request) {

        ConviteEntity convite =
                buscarConviteValido(request.getToken());

        if (usuarioRepository.existsByEmail(convite.getEmail())) {
            throw new ConflictException(
                    "Já existe uma conta cadastrada com esse e-mail"
            );
        }

        LocalDateTime agora = LocalDateTime.now();

        UsuarioEntity usuario = UsuarioEntity.builder()
                .nome(request.getNome().trim())
                .email(convite.getEmail())
                .senha(passwordEncoder.encode(request.getSenha()))
                .emailVerificado(true)
                .role(UsuarioRole.USER)
                .termosAceitosEm(agora)
                .versaoTermos(VERSAO_TERMOS)
                .politicaPrivacidadeCienteEm(agora)
                .versaoPoliticaPrivacidade(VERSAO_POLITICA_PRIVACIDADE)
                .build();

        usuarioRepository.save(usuario);

        convite.setStatus(ConviteStatus.ACEITO);
        convite.setAceitoEm(agora);

        conviteRepository.save(convite);
    }

    private ConviteEntity buscarConviteValido(String token) {

        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException(
                    "Token do convite é obrigatório"
            );
        }

        ConviteEntity convite =
                conviteRepository.findByToken(token)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Convite inválido"
                                )
                        );

        atualizarStatusSeExpirado(convite);

        if (convite.getStatus() == ConviteStatus.EXPIRADO) {
            throw new IllegalArgumentException(
                    "Este convite expirou"
            );
        }

        if (convite.getStatus() == ConviteStatus.CANCELADO) {
            throw new IllegalArgumentException(
                    "Este convite foi cancelado"
            );
        }

        if (convite.getStatus() == ConviteStatus.ACEITO) {
            throw new IllegalArgumentException(
                    "Este convite já foi utilizado"
            );
        }

        return convite;
    }

    private void atualizarStatusSeExpirado(
            ConviteEntity convite
    ) {

        if (convite.getStatus() == ConviteStatus.PENDENTE
                && convite.getExpiraEm()
                .isBefore(LocalDateTime.now())) {

            convite.setStatus(ConviteStatus.EXPIRADO);

            conviteRepository.save(convite);
        }
    }

    private ConviteDTOResponse paraResponse(
            ConviteEntity convite
    ) {

        return ConviteDTOResponse.builder()
                .id(convite.getId())
                .email(convite.getEmail())
                .status(convite.getStatus())
                .criadoEm(convite.getCriadoEm())
                .expiraEm(convite.getExpiraEm())
                .aceitoEm(convite.getAceitoEm())
                .build();
    }

    private String normalizarEmail(String email) {

        return email
                .trim()
                .toLowerCase();
    }
}