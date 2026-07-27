package com.dev.gestorNF.business.dto.out;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class NotaFiscalDTOResponse {

    private Long id;
    private String nomeVendedor;
    private int numeroNotaFiscal;
    private String nomeEmpresa;
    private double valorNotaFiscal;
    private LocalDate dataVenda;
}
