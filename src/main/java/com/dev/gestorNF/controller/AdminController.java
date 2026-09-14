package com.dev.gestorNF.controller;

import com.dev.gestorNF.business.AdminGestaoService;
import com.dev.gestorNF.business.ConviteService;
import com.dev.gestorNF.business.dto.in.AdminAssinaturaDTORequest;
import com.dev.gestorNF.business.dto.in.AdminPagamentoDTORequest;
import com.dev.gestorNF.business.dto.in.ConviteDTORequest;
import com.dev.gestorNF.business.dto.out.AdminClienteDTOResponse;
import com.dev.gestorNF.business.dto.out.AdminResumoDTOResponse;
import com.dev.gestorNF.business.dto.out.ConviteDTOResponse;
import com.dev.gestorNF.infrastructure.security.SecurityConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
@Tag(name = "Admin", description = "Operações administrativas do GestorNF")
@SecurityRequirement(name = SecurityConfig.SECURITY_SCHEME)
public class AdminController {

    private final ConviteService conviteService;
    private final AdminGestaoService adminGestaoService;

    @Operation(summary = "Criar convite")
    @PostMapping("/convites")
    public ResponseEntity<ConviteDTOResponse> criarConvite(@Valid @RequestBody ConviteDTORequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED).body(conviteService.criarConvite(request));
    }

    @Operation(summary = "Listar convites")
    @GetMapping("/convites")
    public ResponseEntity<List<ConviteDTOResponse>> listarConvites() {

        return ResponseEntity.ok(conviteService.listarConvites());
    }
    @Operation(summary = "Listar clientes do GestorNF")
    @GetMapping("/clientes")
    public ResponseEntity<List<AdminClienteDTOResponse>>
    listarClientes() {
        return ResponseEntity.ok(adminGestaoService.listarClientes());
    }
    @Operation(summary = "Resumo administrativo")
    @GetMapping("/resumo")
    public ResponseEntity<AdminResumoDTOResponse> buscarResumo() {
        return ResponseEntity.ok(adminGestaoService.buscarResumo());
    }
    @Operation(summary = "Configurar assinatura de um cliente")
    @PatchMapping("/clientes/{usuarioId}/assinatura")
    public ResponseEntity<AdminClienteDTOResponse>
    configurarAssinatura(@PathVariable Long usuarioId, @Valid @RequestBody AdminAssinaturaDTORequest request) {

        return ResponseEntity.ok(adminGestaoService.configurarAssinatura(usuarioId, request));
    }

    @Operation(summary = "Cancelar convite")
    @DeleteMapping("/convites/{id}")
    public ResponseEntity<Void> cancelarConvite(@PathVariable Long id) {

        conviteService.cancelarConvite(id);
        return ResponseEntity.noContent().build();
    }
    @Operation(summary = "Suspender assinatura de um cliente")
    @PatchMapping("/clientes/{usuarioId}/suspender")
    public ResponseEntity<AdminClienteDTOResponse> suspenderAssinatura(@PathVariable Long usuarioId) {

        return ResponseEntity.ok(adminGestaoService.suspenderAssinatura(usuarioId));
    }
    @Operation(summary = "Reativar assinatura de um cliente")
    @PatchMapping("/clientes/{usuarioId}/reativar")
    public ResponseEntity<AdminClienteDTOResponse>
    reativarAssinatura(@PathVariable Long usuarioId) {

        return ResponseEntity.ok(adminGestaoService.reativarAssinatura(usuarioId));
    }
    @Operation(
            summary = "Registrar pagamento de um cliente"
    )
    @PostMapping(
            "/clientes/{usuarioId}/pagamentos"
    )
    public ResponseEntity<AdminClienteDTOResponse>
    registrarPagamento(@PathVariable Long usuarioId, @Valid @RequestBody AdminPagamentoDTORequest request) {

        return ResponseEntity.ok(
                adminGestaoService.registrarPagamento(usuarioId, request));
    }
}