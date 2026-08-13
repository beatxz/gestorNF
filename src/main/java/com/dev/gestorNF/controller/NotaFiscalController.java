package com.dev.gestorNF.controller;

import com.dev.gestorNF.business.NotaFiscalService;
import com.dev.gestorNF.business.dto.in.NotaFiscalDTORequest;
import com.dev.gestorNF.business.dto.out.NotaFiscalDTOResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notaFiscal")
public class NotaFiscalController {

    private final NotaFiscalService notaFiscalService;

    @PostMapping
    public ResponseEntity<NotaFiscalDTOResponse>cadastrarNotaFiscal(@RequestHeader("Authorization") String token,
                                                                    @RequestBody NotaFiscalDTORequest notaFiscalDTORequest){
    return ResponseEntity.ok(notaFiscalService.cadastrarNotaFiscal(token,notaFiscalDTORequest));
    }
    @GetMapping
    public ResponseEntity<NotaFiscalDTOResponse>buscarNotaFiscal(@RequestHeader("Authorization") String token,
                                                                 @RequestParam("id") Long idVendedor,
                                                                 @RequestParam("notaFiscal") int numeroNotaFiscal){
        return ResponseEntity.ok(notaFiscalService.buscarNotaFiscal(token,idVendedor,numeroNotaFiscal));
    }
}
