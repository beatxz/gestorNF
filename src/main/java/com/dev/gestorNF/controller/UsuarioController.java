package com.dev.gestorNF.controller;

import com.dev.gestorNF.business.UsuarioService;
import com.dev.gestorNF.business.dto.in.ExcluirContaDTORequest;
import com.dev.gestorNF.business.dto.in.LoginDTORequest;
import com.dev.gestorNF.business.dto.in.RedefinirSenhaDTORequest;
import com.dev.gestorNF.business.dto.out.UsuarioDTOResponse;
import com.dev.gestorNF.infrastructure.security.SecurityConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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

//    @Operation(summary = "Cadastro usuário", description = "Cadastra um novo usuário")
//    @ApiResponse(responseCode = "200", description = "usuário salvo com sucesso")
//    @ApiResponse(responseCode = "400", description = "usuário já cadastrado")
//    @ApiResponse(responseCode = "500", description = "Erro de servidor")
//    @PostMapping
//    public ResponseEntity<UsuarioDTOResponse> salvarUsuario(@Valid @RequestBody UsuarioDTORequest usuarioDTORequest) {
//        return ResponseEntity.ok(usuarioService.salvarUsuario(usuarioDTORequest));
//    }
    @Operation(summary = "Login usuário", description = "Faz o login do usuário")
    @ApiResponse(responseCode = "200", description = "Login efetuado sucesso")
    @ApiResponse(responseCode = "400", description = "Usuário não cadastrado")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @PostMapping("/login")
    public ResponseEntity<String>login(@Valid @RequestBody LoginDTORequest loginDTORequest){
        return ResponseEntity.ok(usuarioService.autenticarUsuario(loginDTORequest));
    }
    @Operation(summary = "Deletar conta do usuario", description = "Deletar conta do usuario")
    @ApiResponse(responseCode = "200", description = "Usuário deletado com sucesso")
    @ApiResponse(responseCode = "400", description = "Usuário não encontrado")
    @ApiResponse(responseCode = "401", description = "Senha atual incorreta")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @DeleteMapping
    public ResponseEntity<Void> deletarMinhaConta(@RequestHeader(name = "Authorization") String token,
                                                  @Valid @RequestBody ExcluirContaDTORequest request) {
        usuarioService.deletarUsuario(token, request);
        return ResponseEntity.noContent().build();
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
    @Operation(summary = "Solicitação para recuperar senha ", description = "Solicitação para recuperar senha")
    @ApiResponse(responseCode = "200", description = "Solicitação realizada com sucesso")
    @ApiResponse(responseCode = "400", description = "Usuário não encontrado")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @PostMapping("/esqueci-senha")
    public ResponseEntity<String> solicitarRecuperacaoSenha(@RequestParam String email) {
        usuarioService.solicitarRecuperacaoSenha(email);
        return ResponseEntity.ok("Se existir uma conta com esse e-mail, enviaremos as instruções de recuperação.");
    }
    @Operation(summary = "Redefinir senha ", description = "Redefinir senha")
    @ApiResponse(responseCode = "200", description = "Redefinição realizada com sucesso")
    @ApiResponse(responseCode = "400", description = "Usuário não encontrado")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @PostMapping("/redefinir-senha")
    public ResponseEntity<String> redefinirSenha(@Valid @RequestBody RedefinirSenhaDTORequest request) {
        usuarioService.redefinirSenha(request);
        return ResponseEntity.ok("Senha redefinida com sucesso!");
    }
    @Operation(summary = "Buscar usuário logado", description = "Retorna os dados do usuário autenticado")
    @GetMapping("/me")
    public ResponseEntity<UsuarioDTOResponse> buscarUsuarioLogado(@RequestHeader(name = "Authorization") String token) {
        return ResponseEntity.ok(usuarioService.buscarUsuarioLogado(token));
    }
    @Operation(summary = "Alterar comissão total", description = "Altera a comissão total da empresa do usuário autenticado")
    @ApiResponse(responseCode = "200" , description = "Cliente editado com sucesso")
    @ApiResponse(responseCode = "400", description = "Não foi possível editar dados do cliente")
    @ApiResponse(responseCode = "403", description = "Falha na autenticação")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @PatchMapping("/comissao-total")
    public ResponseEntity<UsuarioDTOResponse> atualizarComissaoTotal(@RequestHeader(name = "Authorization") String token,
                                                                     @RequestBody Double comissaoTotal) {
        return ResponseEntity.ok(usuarioService.atualizarComissaoTotal(token, comissaoTotal));
    }
}
