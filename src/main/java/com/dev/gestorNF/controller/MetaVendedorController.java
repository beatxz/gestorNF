package com.dev.gestorNF.controller;

import com.dev.gestorNF.business.MetaVendedorService;
import com.dev.gestorNF.business.dto.in.MetaMensalDTORequest;
import com.dev.gestorNF.business.dto.out.MetaVendedorDTOResponse;
import com.dev.gestorNF.infrastructure.security.SecurityConfig;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;

@RestController
@RequiredArgsConstructor
@RequestMapping("/meta-vendedor")
@SecurityRequirement(
        name = SecurityConfig.SECURITY_SCHEME
)
public class MetaVendedorController {

    private final MetaVendedorService metaVendedorService;


    @GetMapping("/{idVendedor}")
    public ResponseEntity<MetaVendedorDTOResponse> buscarMeta(
            @RequestHeader("Authorization") String token,
            @PathVariable Long idVendedor,
            @RequestParam("mes") YearMonth mes
    ) {

        return ResponseEntity.ok(
                metaVendedorService.buscarMeta(
                        token,
                        idVendedor,
                        mes
                )
        );
    }


    @PutMapping("/{idVendedor}")
    public ResponseEntity<MetaVendedorDTOResponse> salvarMeta(
            @RequestHeader("Authorization") String token,
            @PathVariable Long idVendedor,
            @RequestParam("mes") YearMonth mes,
            @Valid
            @RequestBody MetaMensalDTORequest request
    ) {

        return ResponseEntity.ok(
                metaVendedorService.salvarMeta(
                        token,
                        idVendedor,
                        mes,
                        request
                )
        );
    }
}