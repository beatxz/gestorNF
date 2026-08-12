package com.dev.gestorNF.controller;

import com.dev.gestorNF.business.VendedorService;
import com.dev.gestorNF.business.dto.in.VendedorDTORequest;
import com.dev.gestorNF.business.dto.out.VendedorDTOResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/vendedor")

public class VendedorController {

    private final VendedorService vendedorService;

    @PostMapping
    public ResponseEntity<VendedorDTOResponse> cadastrarVendedor(@RequestHeader("Authorization") String token,
                                                                @RequestBody VendedorDTORequest vendedorDTORequest){
        return ResponseEntity.ok(vendedorService.cadastroVendedor(token,vendedorDTORequest));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarVendedor(@PathVariable("id") Long idVendedor){
        vendedorService.deletaVendedor(idVendedor);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/{id}")
    public ResponseEntity<VendedorDTOResponse> buscaVendedorId(@RequestHeader("Authorization") String token,
                                                               @RequestParam ("id") Long idVendedor ){
        return ResponseEntity.ok(vendedorService.buscarVendedorPorId(token,idVendedor));
    }
    @PatchMapping
    public ResponseEntity<VendedorDTOResponse> updateComissao(@RequestHeader("Authorization") String token,
                                                              @RequestParam("id") Long idVendedor,
                                                              @RequestBody Double comissao){
        return ResponseEntity.ok(vendedorService.updateComissao(token, idVendedor,comissao));
    }

}
