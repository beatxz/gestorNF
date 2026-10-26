
package com.dev.gestorNF.controller;

import com.dev.gestorNF.business.AgendaService;
import com.dev.gestorNF.business.dto.out.AgendaResponse;
import com.dev.gestorNF.infrastructure.security.SecurityConfig;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/agenda")
@RequiredArgsConstructor
@SecurityRequirement(name = SecurityConfig.SECURITY_SCHEME)
public class AgendaController {

    private final AgendaService agendaService;

    @GetMapping
    public ResponseEntity<List<AgendaResponse>> listar(
            @RequestHeader("Authorization") String token,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime inicio,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime fim
    ) {
        return ResponseEntity.ok(
                agendaService.listar(token, inicio, fim)
        );
    }

    @PostMapping
    public ResponseEntity<AgendaResponse> criar(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody com.dev.gestorNF.business.dto.agenda.AgendaRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(agendaService.criar(token, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AgendaResponse> atualizar(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @Valid @RequestBody com.dev.gestorNF.business.dto.agenda.AgendaRequest request
    ) {
        return ResponseEntity.ok(
                agendaService.atualizar(token, id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id
    ) {
        agendaService.excluir(token, id);
        return ResponseEntity.noContent().build();
    }
}
