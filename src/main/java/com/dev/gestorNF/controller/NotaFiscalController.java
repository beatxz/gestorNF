package com.dev.gestorNF.controller;

import com.dev.gestorNF.business.NotaFiscalService;
import com.dev.gestorNF.business.dto.in.NotaFiscalDTORequest;
import com.dev.gestorNF.business.dto.out.NotaFiscalDTOResponse;
import com.dev.gestorNF.business.dto.out.ResultadoGeralDTO;
import com.dev.gestorNF.infrastructure.security.SecurityConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/notaFiscal")
@Tag( name = "Nota Fiscal" , description = "Cadastro de nota fiscal e configurações")
@SecurityRequirement(name = SecurityConfig.SECURITY_SCHEME)

public class NotaFiscalController {

    private final NotaFiscalService notaFiscalService;

    @Operation(summary = "Cadastrar nota fiscal", description = "Cadastro de nota Fiscal")
    @ApiResponse(responseCode = "200" , description = "Nota cadastrada com sucesso")
    @ApiResponse(responseCode = "400", description = "Nota já cadastrada")
    @ApiResponse(responseCode = "403", description = "Falha na autenticação")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @PostMapping
    public ResponseEntity<NotaFiscalDTOResponse>cadastrarNotaFiscal(@RequestHeader(name = "Authorization",required = false) String token,
                                                                    @RequestBody NotaFiscalDTORequest notaFiscalDTORequest){
    return ResponseEntity.ok(notaFiscalService.cadastrarNotaFiscal(token,notaFiscalDTORequest));
    }
    @Operation(summary = "Buscar nota fiscal", description = "Busca de nota Fiscal")
    @ApiResponse(responseCode = "200" , description = "Nota encontrada com sucesso")
    @ApiResponse(responseCode = "400", description = "Nota não encontrada")
    @ApiResponse(responseCode = "403", description = "Falha na autenticação")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @GetMapping
    public ResponseEntity<NotaFiscalDTOResponse> buscarNotaFiscal(@RequestHeader(name = "Authorization", required = false) String token,
                                                                  @RequestParam("notaFiscal") int numeroNotaFiscal) {

        return ResponseEntity.ok(notaFiscalService.buscarNotaFiscal(token, numeroNotaFiscal));
    }
    @Operation(summary = "Deletar nota fiscal", description = "Deleta nota Fiscal")
    @ApiResponse(responseCode = "200" , description = "Nota deletada com sucesso")
    @ApiResponse(responseCode = "400", description = "Nota não encontrada")
    @ApiResponse(responseCode = "403", description = "Falha na autenticação")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @DeleteMapping
    public ResponseEntity<Void> DeletaNotaFiscal(@RequestHeader(name = "Authorization", required = false) String token,
                                                 @RequestParam("numeroNotaFiscal") int numeroNotaFiscal){
        notaFiscalService.deletarNotaFiscal(token,numeroNotaFiscal);
        return ResponseEntity.ok().build();
    }
    @Operation(summary = "Buscar todas as notas fiscais", description = "Busca todas as notas fiscais")
    @ApiResponse(responseCode = "200" , description = "Notas encontradas com sucesso")
    @ApiResponse(responseCode = "400", description = "Nota não encontrada")
    @ApiResponse(responseCode = "403", description = "Falha na autenticação")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @GetMapping("/vendedor/{idVendedor}")
    public ResponseEntity<List<NotaFiscalDTOResponse>> buscarNotasDoVendedor(
            @RequestHeader(name = "Authorization", required = false) String token,
            @PathVariable Long idVendedor) {

        return ResponseEntity.ok(
                notaFiscalService.buscarNotasDoVendedor(token, idVendedor)
        );
    }
    @Operation(summary = "Valor total de notas fiscais mensal", description = "Valor total mensal de notas fiscis")
    @ApiResponse(responseCode = "200" , description = "Valor calculado com sucesso")
    @ApiResponse(responseCode = "400", description = "Notas não encontradas")
    @ApiResponse(responseCode = "403", description = "Falha na autenticação")
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
    @ApiResponse(responseCode = "403", description = "Falha na autenticação")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @GetMapping("/valorComissao")
    public ResponseEntity<Double>valorTotalComissao(@RequestHeader(name = "Authorization",required = false) String token,
                                                    @RequestParam("id") Long idVendedor,
                                                    @RequestParam("mes") YearMonth yearMonth){
        return ResponseEntity.ok(notaFiscalService.valorTotalComissao(token,idVendedor,yearMonth));
    }
    @Operation(summary = "Resultado geral mensal", description = "Retorna vendas e comissões de todos os vendedores no mês")
    @ApiResponse(responseCode = "200", description = "Resultado calculado com sucesso")
    @ApiResponse(responseCode = "403", description = "Falha na autenticação")
    @GetMapping("/resultado-geral")
    public ResponseEntity<ResultadoGeralDTO> buscarResultadoGeral(@RequestHeader(name = "Authorization", required = false) String token, @RequestParam("mes") YearMonth mes) {

        return ResponseEntity.ok(notaFiscalService.buscarResultadoGeral(token, mes));
    }
    @Operation(
            summary = "Exportar resultado geral em PDF",
            description = "Gera o relatório consolidado mensal de todos os vendedores"
    )
    @ApiResponse(
            responseCode = "200",
            description = "PDF gerado com sucesso"
    )
    @ApiResponse(
            responseCode = "403",
            description = "Falha na autenticação"
    )
    @GetMapping("/resultado-geral/pdf")
    public ResponseEntity<byte[]> gerarPdfResultadoGeral(
            @RequestHeader(
                    name = "Authorization",
                    required = false
            ) String token,
            @RequestParam("mes") YearMonth mes
    ) {

        byte[] pdf =
                notaFiscalService
                        .gerarPdfResultadoGeral(
                                token,
                                mes
                        );

        String nomeArquivo =
                "resultado-geral-"
                        + mes
                        + ".pdf";

        return ResponseEntity.ok()
                .header(
                        "Content-Type",
                        "application/pdf"
                )
                .header(
                        "Content-Disposition",
                        "attachment; filename=\""
                                + nomeArquivo
                                + "\""
                )
                .body(pdf);
    }
    @Operation(summary = "Relatório mensal", description = "Relatório mensal")
    @ApiResponse(responseCode = "200" , description = "Relatório exportado com sucesso")
    @ApiResponse(responseCode = "400", description = "Notas não encontradas")
    @ApiResponse(responseCode = "403", description = "Falha na autenticação")
    @ApiResponse(responseCode = "500", description = "Erro de servidor")
    @GetMapping("/relatorio")
    public ResponseEntity<byte[]> gerarRelatorioMensal(@RequestHeader(name = "Authorization", required = false) String token,
                                                       @RequestParam("mes") YearMonth mes,
                                                       @RequestParam(value = "idVendedor", required = false) Long idVendedor) {

        byte[] pdf =
                notaFiscalService.gerarRelatorioMensal(token, mes, idVendedor);
        String nomeArquivo = "relatorio-" + mes + ".pdf";

        return ResponseEntity.ok().header(
                "Content-Type", "application/pdf")
                .header("Content-Disposition", "attachment; filename=\"" + nomeArquivo + "\"").body(pdf);
    }
}
