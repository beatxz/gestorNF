package com.dev.gestorNF.business;

import com.dev.gestorNF.business.dto.in.RedefinirSenhaDTORequest;
import com.dev.gestorNF.business.dto.in.UsuarioDTORequest;
import com.dev.gestorNF.business.dto.out.UsuarioDTOResponse;
import com.dev.gestorNF.business.mapper.UsuarioConverter;
import com.dev.gestorNF.infrastructure.entity.out.UsuarioEntity;
import com.dev.gestorNF.infrastructure.exception.ConflictException;
import com.dev.gestorNF.infrastructure.exception.TooManyRequestsException;
import com.dev.gestorNF.infrastructure.exception.UnauthorizedException;
import com.dev.gestorNF.infrastructure.repository.UsuarioRepository;
import com.dev.gestorNF.infrastructure.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final JwtUtil jwtUtil;
    private final UsuarioConverter usuarioConverter;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;


    public boolean verificaEmailExiste(String email){
        return usuarioRepository.existsByEmail(email);
    }

    public void emailExiste (String email){
        try{
            boolean existe = usuarioRepository.existsByEmail(email);
            if(existe){
                throw new ConflictException("Email já cadastrado ");
            }
        }catch (ConflictException e ){
            throw new ConflictException("Email já cadastrado ", e.getCause());
        }

    }
    public UsuarioDTOResponse salvarUsuario(UsuarioDTORequest usuarioDTORequest) {

        emailExiste(usuarioDTORequest.getEmail());

        usuarioDTORequest.setSenha(
                passwordEncoder.encode(usuarioDTORequest.getSenha())
        );

        UsuarioEntity usuarioEntity =
                usuarioConverter.paraUsuarioEntity(usuarioDTORequest);

        String tokenGerado = UUID.randomUUID().toString();

        usuarioEntity.setTokenVerificacao(tokenGerado);
        usuarioEntity.setEmailVerificado(false);

        UsuarioEntity usuarioSalvo =
                usuarioRepository.save(usuarioEntity);

        emailService.enviarEmailVerificacao(usuarioSalvo.getEmail(), usuarioSalvo.getNome(), usuarioSalvo.getTokenVerificacao());

        return usuarioConverter.paraUsuarioDTOResponse(usuarioSalvo);
    }

    public void verificarEmail(String token) {

        UsuarioEntity usuario = usuarioRepository.findByTokenVerificacao(token)
                .orElseThrow(() -> new RuntimeException("Token de verificação inválido"));

        usuario.setEmailVerificado(true);
        usuario.setTokenVerificacao(null);

        usuarioRepository.save(usuario);
    }
    public void solicitarRecuperacaoSenha(String email){

        UsuarioEntity usuario =
                usuarioRepository.findByEmail(email).orElse(null);

        if (usuario == null) {
            return;
        }

        LocalDateTime agora = LocalDateTime.now();

        Integer tentativas = usuario.getTentativasRecuperacao();

        if (tentativas == null) {
            tentativas = 0;
        }

        if (usuario.getInicioJanelaRecuperacao() == null ||
                usuario.getInicioJanelaRecuperacao().plusHours(1).isBefore(agora)) {
            usuario.setInicioJanelaRecuperacao(agora);
            usuario.setTentativasRecuperacao(0);

            tentativas = 0;
        }

        if (tentativas >= 3) {
            return;
        }

        String token = UUID.randomUUID().toString();

        usuario.setTokenRecuperacaoSenha(token);
        usuario.setExpiracaoTokenRecuperacao(
                agora.plusMinutes(30)
        );

        usuario.setTentativasRecuperacao(
                tentativas + 1
        );

        usuarioRepository.save(usuario);
        emailService.enviarEmailRecuperacaoSenha(
                usuario.getEmail(),
                usuario.getNome(),
                token
        );

    }
    public void redefinirSenha(RedefinirSenhaDTORequest request) {

        UsuarioEntity usuario = usuarioRepository
                .findByTokenRecuperacaoSenha(request.getToken())
                .orElseThrow(() -> new RuntimeException("Token de recuperação inválido"));

        if (usuario.getExpiracaoTokenRecuperacao()
                .isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token de recuperação expirado");
        }

        usuario.setSenha(passwordEncoder.encode(request.getNovaSenha()));

        usuario.setTokenRecuperacaoSenha(null);
        usuario.setExpiracaoTokenRecuperacao(null);

        usuario.setTentativasLoginFalhas(0);
        usuario.setBloqueadoAte(null);

        usuario.setTentativasRecuperacao(0);
        usuario.setInicioJanelaRecuperacao(null);

        usuarioRepository.save(usuario);
    }

    public String autenticarUsuario(UsuarioDTORequest usuarioDTORequest) {
        UsuarioEntity usuario = usuarioRepository
                .findByEmail(usuarioDTORequest.getEmail())
                .orElse(null);

        if (usuario == null) {
            throw new UnauthorizedException("Usuário ou senha inválidos");
        }

        LocalDateTime agora = LocalDateTime.now();

        if (usuario.getBloqueadoAte() != null) {

            if (usuario.getBloqueadoAte().isAfter(agora)) {
                throw new TooManyRequestsException("Muitas tentativas de login. Tente novamente em alguns minutos.");
            }

            usuario.setBloqueadoAte(null);
            usuario.setTentativasLoginFalhas(0);
            usuarioRepository.save(usuario);
        }

        try {

            Authentication authentication =
                    authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(
                                    usuarioDTORequest.getEmail(),
                                    usuarioDTORequest.getSenha()
                            )
                    );

            if (!usuario.isEmailVerificado()) {
                throw new UnauthorizedException(
                        "Email ainda não foi verificado"
                );
            }

            usuario.setTentativasLoginFalhas(0);
            usuario.setBloqueadoAte(null);

            usuarioRepository.save(usuario);

            return "Bearer " +
                    jwtUtil.generateToken(authentication.getName());

        } catch (BadCredentialsException e) {
            registrarTentativaLoginFalha(usuario);
            throw new UnauthorizedException(
                    "Usuário ou senha inválidos"
            );
        }
    }
    public void deletarUsuario(String token) {

        String email = jwtUtil.extrairEmailToken(token.substring(7));
        UsuarioEntity usuarioEntity = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        usuarioRepository.delete(usuarioEntity);
    }

    public UsuarioDTOResponse buscaUsuarioEmail(String email) {
        try {
           return usuarioConverter.paraUsuarioDTOResponse
                    (usuarioRepository.findByEmail(email)
                            .orElseThrow(() -> new RuntimeException("Usuario não encontrado")));
        } catch (RuntimeException e) {
            throw new RuntimeException("Usuario não encontrado");
        }
    }
    private void registrarTentativaLoginFalha(UsuarioEntity usuario) {

        int tentativas =
                usuario.getTentativasLoginFalhas() == null
                        ? 0
                        : usuario.getTentativasLoginFalhas();

        tentativas++;

        usuario.setTentativasLoginFalhas(tentativas);

        if (tentativas >= 5) {
            usuario.setBloqueadoAte(LocalDateTime.now().plusMinutes(15));

            usuarioRepository.save(usuario);
            throw new TooManyRequestsException(
                    "Muitas tentativas de login. Tente novamente em 15 minutos.");
        }

        usuarioRepository.save(usuario);
    }

}
