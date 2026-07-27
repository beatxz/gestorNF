package com.dev.gestorNF.business.dto.in;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class NotaFiscalDTORequest {

    private String nomeVendedor;
    private int numeroNotaFiscal;
    private String nomeEmpresa;
    private double valorNotaFiscal;
    private LocalDate dataVenda;
}
