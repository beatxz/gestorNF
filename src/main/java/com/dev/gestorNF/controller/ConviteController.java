package com.dev.gestorNF.controller;

import com.dev.gestorNF.business.ConviteService;
import com.dev.gestorNF.business.dto.in.AceitarConviteDTORequest;
import com.dev.gestorNF.business.dto.out.ConvitePublicoDTOResponse;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/convites")
public class ConviteController {

    private final ConviteService conviteService;

    @Operation(summary = "Validar convite")
    @GetMapping("/validar")
    public ResponseEntity<ConvitePublicoDTOResponse> validarConvite(
            @RequestParam String token
    ) {

        return ResponseEntity.ok(
                conviteService.validarConvite(token)
        );
    }

    @Operation(summary = "Aceitar convite e criar conta")
    @PostMapping("/aceitar")
    public ResponseEntity<Void> aceitarConvite(
            @Valid @RequestBody AceitarConviteDTORequest request
    ) {

        conviteService.aceitarConvite(request);

        return ResponseEntity.noContent().build();
    }
}