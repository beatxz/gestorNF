package com.dev.gestorNF.controller;

import com.dev.gestorNF.business.UsuarioService;
import com.dev.gestorNF.business.dto.in.UsuarioDTORequest;
import com.dev.gestorNF.business.dto.out.UsuarioDTOResponse;
import com.dev.gestorNF.infrastructure.security.SecurityConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/usuario")
@Tag(name = ("Usuario"), description = "Cadastro e login do usuário")
@SecurityRequirement(name = SecurityConfig.SECURITY_SCHEME)
public class UsuarioController {

    private final UsuarioService usuarioService;

    @Operation(summary = "Salvar usuário", description = "Cria um novo usuário")
    @ApiResponse(responseCode = "200", description = "usuário salvo com sucesso")
    @ApiResponse(responseCode = "400", description = "usuário já cadastrado")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @PostMapping
    public ResponseEntity<UsuarioDTOResponse> salvarUsuario(@RequestBody UsuarioDTORequest usuarioDTORequest) {
        return ResponseEntity.ok(usuarioService.salvarUsuario(usuarioDTORequest));
    }
    @Operation(summary = "Login usuário", description = "Faz o login do usuário")
    @ApiResponse(responseCode = "200", description = "Login efetuado sucesso")
    @ApiResponse(responseCode = "400", description = "Usuário não cadastrado")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @PostMapping("/login")
    public ResponseEntity<String>login(@RequestBody UsuarioDTORequest usuarioDTORequest){
        return ResponseEntity.ok(usuarioService.autenticarUsuario(usuarioDTORequest));
    }
    @Operation(summary = "Deletar usuário", description = "Deleta um usuário por email")
    @ApiResponse(responseCode = "200", description = "Usuário deletado com sucesso")
    @ApiResponse(responseCode = "400", description = "Usuário não encontrado")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @DeleteMapping("/{email}")
    public ResponseEntity<Void>deletarUsuarioEmail(@PathVariable String email){
        usuarioService.deletaUsuarioEmail(email);
         return ResponseEntity.ok().build();
    }
    @Operation(summary = "Verificar email", description = "verifica usuario por email")
    @ApiResponse(responseCode = "200", description = "Usuário verificado com sucesso")
    @ApiResponse(responseCode = "400", description = "Usuário não verificado")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @GetMapping("/verificar-email")
    public ResponseEntity<String> verificarEmail(@RequestParam String token) {
        usuarioService.verificarEmail(token);
        return ResponseEntity.ok("Email verificado com sucesso!"
        );
    }
    @Operation(summary = "Buscar usuário", description = "Busca um usuário por Email")
    @ApiResponse(responseCode = "200", description = "usuário encontrado com sucesso")
    @ApiResponse(responseCode = "400", description = "usuário não encontrado")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @GetMapping
    public ResponseEntity<UsuarioDTOResponse>buscarUsuarioEmail(@RequestParam("email") String email){
       return ResponseEntity.ok(usuarioService.buscaUsuarioEmail(email));
    }
}
