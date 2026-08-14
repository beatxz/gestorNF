package com.dev.gestorNF.controller;

import com.dev.gestorNF.business.VendedorService;
import com.dev.gestorNF.business.dto.in.VendedorDTORequest;
import com.dev.gestorNF.business.dto.out.VendedorDTOResponse;
import com.dev.gestorNF.infrastructure.security.SecurityConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/vendedor")
@Tag(name = "vendedor", description = "Cadastro e configuração de vendedor")
@SecurityRequirement(name = SecurityConfig.SECURITY_SCHEME)

public class VendedorController {

    private final VendedorService vendedorService;

    @Operation(summary = "Cadastrar vendedor", description = "Cadastro do vendedor")
    @ApiResponse(responseCode = "200" , description = "Cadastro realizado com sucesso")
    @ApiResponse(responseCode = "400" , description = "Vendedor já cadastrado")
    @ApiResponse(responseCode = "403", description = "Falha na autenticação")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @PostMapping
    public ResponseEntity<VendedorDTOResponse> cadastrarVendedor(@RequestHeader(name = "Authorization",required = false) String token,
                                                                @RequestBody VendedorDTORequest vendedorDTORequest){
        return ResponseEntity.ok(vendedorService.cadastroVendedor(token,vendedorDTORequest));
    }
    @Operation(summary = "Deletar vendedor", description = "Deleta vendedor")
    @ApiResponse(responseCode = "200" , description = "Vendedor deletado com sucesso")
    @ApiResponse(responseCode = "400" , description = "Vendedor não encontrado")
    @ApiResponse(responseCode = "403", description = "Falha na autenticação")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarVendedor(@PathVariable("id") Long idVendedor){
        vendedorService.deletaVendedor(idVendedor);
        return ResponseEntity.ok().build();
    }
    @Operation(summary = "Buscar vendedor", description = "Buscar vendedor por Id")
    @ApiResponse(responseCode = "200" , description = "Vendedor encontrado com sucesso")
    @ApiResponse(responseCode = "400" , description = "Vendedor não encontrado")
    @ApiResponse(responseCode = "403", description = "Falha na autenticação")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @GetMapping("/{id}")
    public ResponseEntity<VendedorDTOResponse> buscaVendedorId(@RequestHeader(name = "Authorization",required = false) String token,
                                                               @RequestParam ("id") Long idVendedor ){
        return ResponseEntity.ok(vendedorService.buscarVendedorPorId(token,idVendedor));
    }
    @Operation(summary = "Alterar comissão", description = "Altera comissão do vendedor")
    @ApiResponse(responseCode = "200" , description = "Comissão alterada com sucesso")
    @ApiResponse(responseCode = "400" , description = "Vendedor não encontrado")
    @ApiResponse(responseCode = "403", description = "Falha na autenticação")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @PatchMapping
    public ResponseEntity<VendedorDTOResponse> updateComissao(@RequestHeader(name = "Authorization",required = false) String token,
                                                              @RequestParam("id") Long idVendedor,
                                                              @RequestBody Double comissao){
        return ResponseEntity.ok(vendedorService.updateComissao(token, idVendedor,comissao));
    }

}
