package com.dev.gestorNF.controller;

import com.dev.gestorNF.business.ClienteService;
import com.dev.gestorNF.business.dto.in.ClienteDTORequest;
import com.dev.gestorNF.business.dto.out.ClienteDTOResponse;
import com.dev.gestorNF.infrastructure.security.SecurityConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cliente/vendedor/{idVendedor}")
@RequiredArgsConstructor
@SecurityRequirement(name = SecurityConfig.SECURITY_SCHEME)
public class ClienteController {

    private final ClienteService clienteService;

    @Operation(summary = "Buscar cliente por código", description = "Buscar cliente por código")
    @ApiResponse(responseCode = "200" , description = "Cliente encontrado com sucesso")
    @ApiResponse(responseCode = "400", description = "Cliente não encontrado")
    @ApiResponse(responseCode = "403", description = "Falha na autenticação")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @GetMapping("/buscar")
    public ResponseEntity<ClienteDTOResponse> buscarPorCodigo(@RequestHeader("Authorization") String token,
                                                              @PathVariable Long idVendedor,
                                                              @RequestParam String codigo) {

        ClienteDTOResponse resultado = clienteService.buscarPorCodigo(token, idVendedor, codigo);

        if (resultado == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(resultado);
    }

    @Operation(summary = "Cadastrar cliente", description = "Cadastrar cliente")
    @ApiResponse(responseCode = "200" , description = "Cliente cadastrado com sucesso")
    @ApiResponse(responseCode = "400", description = "Cliente não encontrado")
    @ApiResponse(responseCode = "403", description = "Falha na autenticação")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @PostMapping
    public ResponseEntity<ClienteDTOResponse> cadastrarCliente(@RequestHeader("Authorization") String token,
                                                               @PathVariable Long idVendedor,
                                                               @Valid @RequestBody ClienteDTORequest clienteDTORequest) {
        return ResponseEntity.ok(clienteService.cadastrarCliente(token, idVendedor, clienteDTORequest));
    }

    @Operation(summary = "Lista de cliente", description = "Lista de cliente")
    @ApiResponse(responseCode = "200" , description = "Lista encontrada com sucesso")
    @ApiResponse(responseCode = "400", description = "Lista está vazia")
    @ApiResponse(responseCode = "403", description = "Falha na autenticação")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @GetMapping
    public ResponseEntity<List<ClienteDTOResponse>> listarClientes(@RequestHeader("Authorization") String token,
                                                                   @PathVariable Long idVendedor) {

        return ResponseEntity.ok(clienteService.listarClientes(token, idVendedor));
    }

    @Operation(summary = "Editar dados do cliente", description = "Editar dados do cliente")
    @ApiResponse(responseCode = "200" , description = "Cliente editado com sucesso")
    @ApiResponse(responseCode = "400", description = "Não foi possível editar dados do cliente")
    @ApiResponse(responseCode = "403", description = "Falha na autenticação")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @PutMapping("/{id}")
    public ResponseEntity<ClienteDTOResponse> editarCliente(@RequestHeader("Authorization") String token,
                                                            @Valid @PathVariable Long idVendedor,
                                                            @PathVariable Long id,
                                                            @RequestBody ClienteDTORequest clienteDTORequest) {

        return ResponseEntity.ok(clienteService.editarCliente(token, idVendedor, id, clienteDTORequest));
    }

    @Operation(summary = "Alterar Status Do Cliente", description = "Alterar Status Do Cliente")
    @ApiResponse(responseCode = "200" , description = "Status alterado com sucesso")
    @ApiResponse(responseCode = "400", description = "Não foi possível alterar status do cliente")
    @ApiResponse(responseCode = "403", description = "Falha na autenticação")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @PatchMapping("/{id}/status")
    public ResponseEntity<ClienteDTOResponse> alterarStatusCliente(@RequestHeader("Authorization") String token,
                                                                   @PathVariable Long idVendedor,
                                                                   @PathVariable Long id,
                                                                   @RequestParam boolean ativo) {

        return ResponseEntity.ok(clienteService.alterarStatusCliente(token, idVendedor, id, ativo));
    }
}