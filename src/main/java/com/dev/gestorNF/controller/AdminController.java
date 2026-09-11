package com.dev.gestorNF.controller;

import com.dev.gestorNF.business.ConviteService;
import com.dev.gestorNF.business.dto.in.ConviteDTORequest;
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

    @Operation(summary = "Criar convite")
    @PostMapping("/convites")
    public ResponseEntity<ConviteDTOResponse> criarConvite(
            @Valid @RequestBody ConviteDTORequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(conviteService.criarConvite(request));
    }

    @Operation(summary = "Listar convites")
    @GetMapping("/convites")
    public ResponseEntity<List<ConviteDTOResponse>> listarConvites() {

        return ResponseEntity.ok(
                conviteService.listarConvites()
        );
    }

    @Operation(summary = "Cancelar convite.html")
    @DeleteMapping("/convites/{id}")
    public ResponseEntity<Void> cancelarConvite(
            @PathVariable Long id) {

        conviteService.cancelarConvite(id);

        return ResponseEntity.noContent().build();
    }
}