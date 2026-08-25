package com.dev.gestorNF.business;

import com.dev.gestorNF.business.dto.in.RedefinirSenhaDTORequest;
import com.dev.gestorNF.business.dto.in.UsuarioDTORequest;
import com.dev.gestorNF.business.dto.out.UsuarioDTOResponse;
import com.dev.gestorNF.business.mapper.UsuarioConverter;
import com.dev.gestorNF.infrastructure.entity.out.UsuarioEntity;
import com.dev.gestorNF.infrastructure.exception.ConflictException;
import com.dev.gestorNF.infrastructure.exception.UnauthorizedException;
import com.dev.gestorNF.infrastructure.repository.UsuarioRepository;
import com.dev.gestorNF.infrastructure.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
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
        UsuarioEntity usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(()-> new RuntimeException("Usuario não encontrado"));

        String token = UUID.randomUUID().toString();

        usuario.setTokenRecuperacaoSenha(token);
        usuario.setExpiracaoTokenRecuperacao(
                LocalDateTime.now().plusMinutes(30));
        usuarioRepository.save(usuario);

        emailService.enviarEmailRecuperacaoSenha(
                usuario.getEmail(),
                usuario.getNome(),
                token);
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

        usuarioRepository.save(usuario);
    }

    public String autenticarUsuario(UsuarioDTORequest usuarioDTORequest) {
        try {
            UsuarioEntity usuario = usuarioRepository.findByEmail(
                    usuarioDTORequest.getEmail())
                    .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado")
            );
            if (!usuario.isEmailVerificado()) {
                throw new UnauthorizedException("Email ainda não foi verificado");
            }

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(usuarioDTORequest.getEmail(),
                            usuarioDTORequest.getSenha())
            );
            return "Bearer " + jwtUtil.generateToken(authentication.getName());
        } catch (BadCredentialsException | UsernameNotFoundException | AuthorizationDeniedException e) {
            throw new UnauthorizedException("Usuário ou senha invalidos ",e.getCause());
        }
    }
    public void deletaUsuarioEmail(String email){
        usuarioRepository.deleteByEmail(email);
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

}
