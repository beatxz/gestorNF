package com.dev.gestorNF.controller;

import com.dev.gestorNF.business.UsuarioService;
import com.dev.gestorNF.business.dto.in.UsuarioDTORequest;
import com.dev.gestorNF.business.dto.out.UsuarioDTOResponse;
import com.dev.gestorNF.infrastructure.security.SecurityConfig;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/usuario")
@SecurityRequirement(name = SecurityConfig.SECURITY_SCHEME)
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping
    public ResponseEntity<UsuarioDTOResponse> salvarUsuario(@RequestBody UsuarioDTORequest usuarioDTORequest) {
        return ResponseEntity.ok(usuarioService.salvarUsuario(usuarioDTORequest));
    }
    @PostMapping("/login")
    public ResponseEntity<String>login(@RequestBody UsuarioDTORequest usuarioDTORequest){
        return ResponseEntity.ok(usuarioService.autenticarUsuario(usuarioDTORequest));
    }
    @DeleteMapping("/{email}")
    public ResponseEntity<Void>deletarUsuarioEmail(@PathVariable String email){
        usuarioService.deletaUsuarioEmail(email);
         return ResponseEntity.ok().build();
    }
    @GetMapping
    public ResponseEntity<UsuarioDTOResponse>buscarUsuarioEmail(@RequestParam("email") String email){
       return ResponseEntity.ok(usuarioService.buscaUsuarioEmail(email));
    }
}
