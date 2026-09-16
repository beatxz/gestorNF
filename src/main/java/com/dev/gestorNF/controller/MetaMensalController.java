package com.dev.gestorNF.controller;

import com.dev.gestorNF.business.MetaMensalService;
import com.dev.gestorNF.business.dto.in.MetaMensalDTORequest;
import com.dev.gestorNF.business.dto.out.MetaMensalDTOResponse;
import com.dev.gestorNF.infrastructure.security.SecurityConfig;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;

@RestController
@RequiredArgsConstructor
@RequestMapping("/meta")
@SecurityRequirement(
        name = SecurityConfig.SECURITY_SCHEME
)
public class MetaMensalController {

    private final MetaMensalService metaMensalService;


    @GetMapping
    public ResponseEntity<MetaMensalDTOResponse> buscarMeta(
            @RequestHeader("Authorization") String token,
            @RequestParam("mes") YearMonth mes
    ) {

        return ResponseEntity.ok(
                metaMensalService.buscarMeta(
                        token,
                        mes
                )
        );
    }


    @PutMapping
    public ResponseEntity<MetaMensalDTOResponse> salvarMeta(
            @RequestHeader("Authorization") String token,
            @RequestParam("mes") YearMonth mes,
            @Valid
            @RequestBody MetaMensalDTORequest request
    ) {

        return ResponseEntity.ok(
                metaMensalService.salvarMeta(
                        token,
                        mes,
                        request
                )
        );
    }
}