package com.dev.gestorNF.controller;

import com.dev.gestorNF.business.ClienteService;
import com.dev.gestorNF.business.dto.in.ClienteDTORequest;
import com.dev.gestorNF.business.dto.out.ClienteDTOResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cliente/vendedor/{idVendedor}")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @GetMapping("/buscar")
    public ResponseEntity<ClienteDTOResponse> buscarPorCodigo(
            @RequestHeader("Authorization") String token,
            @PathVariable Long idVendedor,
            @RequestParam String codigo) {

        ClienteDTOResponse resultado = clienteService.buscarPorCodigo(token, idVendedor, codigo);

        if (resultado == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(resultado);
    }

    @PostMapping
    public ResponseEntity<ClienteDTOResponse> cadastrarCliente(
            @RequestHeader("Authorization") String token,
            @PathVariable Long idVendedor,
            @RequestBody ClienteDTORequest clienteDTORequest) {

        return ResponseEntity.ok(clienteService.cadastrarCliente(token, idVendedor, clienteDTORequest));
    }

    @GetMapping
    public ResponseEntity<List<ClienteDTOResponse>> listarClientes(
            @RequestHeader("Authorization") String token,
            @PathVariable Long idVendedor) {

        return ResponseEntity.ok(clienteService.listarClientes(token, idVendedor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteDTOResponse> editarCliente(
            @RequestHeader("Authorization") String token,
            @PathVariable Long idVendedor,
            @PathVariable Long id,
            @RequestBody ClienteDTORequest clienteDTORequest) {

        return ResponseEntity.ok(clienteService.editarCliente(token, idVendedor, id, clienteDTORequest));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ClienteDTOResponse> alterarStatusCliente(
            @RequestHeader("Authorization") String token,
            @PathVariable Long idVendedor,
            @PathVariable Long id,
            @RequestParam boolean ativo) {

        return ResponseEntity.ok(clienteService.alterarStatusCliente(token, idVendedor, id, ativo));
    }
}