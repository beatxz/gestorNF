package com.dev.gestorNF.business.dto.in;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class NotaFiscalDTORequest {

    private Long vendedorId;
    private int numeroNotaFiscal;
    private String nomeEmpresa;
    private double valorNotaFiscal;
    private String codigoCliente;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern= "dd-MM-yyyy")
    private LocalDate dataVenda;
    private String cnpj;
    private String municipio;
    private String transportadora;
}
