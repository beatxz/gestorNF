package com.dev.gestorNF.business;

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

import java.net.PasswordAuthentication;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final JwtUtil jwtUtil;
    private final UsuarioConverter usuarioConverter;
    private final PasswordAuthentication passwordAuthentication;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;


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
    public UsuarioDTOResponse salvarUsuario(UsuarioDTORequest usuarioDTORequest){
        emailExiste(usuarioDTORequest.getEmail());
        usuarioDTORequest.setSenha(passwordEncoder.encode(usuarioDTORequest.getSenha()));
        UsuarioEntity usuarioEntity = usuarioConverter.paraUsuarioEntity(usuarioDTORequest);
        return usuarioConverter.paraUsuarioDTOResponse(usuarioRepository.save(usuarioEntity));
    }
    public String autenticarUsuario(UsuarioDTORequest usuarioDTORequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(usuarioDTORequest.getEmail(),
                            usuarioDTORequest.getSenha())
            );
            return "Bearer " + jwtUtil.generateToken(authentication.getName());
        } catch (BadCredentialsException | UsernameNotFoundException | AuthorizationDeniedException e) {
            throw new UnauthorizedException("Usuário ou senha invalidos ",e.getCause());
        }
    }

}
