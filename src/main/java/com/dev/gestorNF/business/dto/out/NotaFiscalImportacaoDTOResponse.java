package com.dev.gestorNF.business.dto.out;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class NotaFiscalImportacaoDTOResponse {

    private Integer numeroNotaFiscal;
    private String codigoCliente;
    private String nomeEmpresa;
    private Double valorNotaFiscal;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private LocalDate dataEmissao;

    private String cnpj;
    private String municipio;
    private String transportadora;
}