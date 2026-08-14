package com.dev.gestorNF.controller;

import com.dev.gestorNF.business.NotaFiscalService;
import com.dev.gestorNF.business.dto.in.NotaFiscalDTORequest;
import com.dev.gestorNF.business.dto.out.NotaFiscalDTOResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notaFiscal")
@Tag( name = "Nota Fiscal" , description = "Cadastro de nota fiscal e configurações")
public class NotaFiscalController {

    private final NotaFiscalService notaFiscalService;

    @Operation(summary = "Cadastrar nota fiscal", description = "Cadastro de nota Fiscal")
    @ApiResponse(responseCode = "200" , description = "Nota cadastrada com sucesso")
    @ApiResponse(responseCode = "400", description = "Nota já cadastrada")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @PostMapping
    public ResponseEntity<NotaFiscalDTOResponse>cadastrarNotaFiscal(@RequestHeader(name = "Authorization",required = false) String token,
                                                                    @RequestBody NotaFiscalDTORequest notaFiscalDTORequest){
    return ResponseEntity.ok(notaFiscalService.cadastrarNotaFiscal(token,notaFiscalDTORequest));
    }
    @Operation(summary = "Buscar nota fiscal", description = "Busca de nota Fiscal")
    @ApiResponse(responseCode = "200" , description = "Nota encontrada com sucesso")
    @ApiResponse(responseCode = "400", description = "Nota não encontrada")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @GetMapping
    public ResponseEntity<NotaFiscalDTOResponse>buscarNotaFiscal(@RequestHeader(name = "Authorization",required = false) String token,
                                                                 @RequestParam("id") Long idVendedor,
                                                                 @RequestParam("notaFiscal") int numeroNotaFiscal){
        return ResponseEntity.ok(notaFiscalService.buscarNotaFiscal(token,idVendedor,numeroNotaFiscal));
    }
    @Operation(summary = "Deletar nota fiscal", description = "Deleta nota Fiscal")
    @ApiResponse(responseCode = "200" , description = "Nota deletada com sucesso")
    @ApiResponse(responseCode = "400", description = "Nota não encontrada")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @DeleteMapping
    public ResponseEntity<Void> DeletaNotaFiscal(@RequestParam("numeroNotaFiscal") int numeroNotaFiscal){
        notaFiscalService.deletarNotaFiscal(numeroNotaFiscal);
        return ResponseEntity.ok().build();
    }
    @Operation(summary = "Valor total de notas fiscais mensal", description = "Valor total mensal de notas fiscis")
    @ApiResponse(responseCode = "200" , description = "Valor calculado com sucesso")
    @ApiResponse(responseCode = "400", description = "Notas não encontradas")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @GetMapping("/valorMensal")
    public ResponseEntity<Double>valorTotalMensal(@RequestHeader(name = "Authorization",required = false) String token,
                                                  @RequestParam("id") Long idVendedor,
                                                  @RequestParam ("mes")YearMonth yearMonth){
       return ResponseEntity.ok(notaFiscalService.valorTotalMensal(token,idVendedor,yearMonth));
    }
    @Operation(summary = "Valor total de comissão mensal", description = "Valor total mensal de comissão")
    @ApiResponse(responseCode = "200" , description = "Valor calculado com sucesso")
    @ApiResponse(responseCode = "400", description = "Notas não encontradas")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @GetMapping("/valorComissao")
    public ResponseEntity<Double>valorTotalComissao(@RequestHeader(name = "Authorization",required = false) String token,
                                                    @RequestParam("id") Long idVendedor,
                                                    @RequestParam("mes") YearMonth yearMonth){
        return ResponseEntity.ok(notaFiscalService.valorTotalComissao(token,idVendedor,yearMonth));
    }
}
