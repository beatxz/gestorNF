package com.dev.gestorNF.business.dto.out;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class NotaFiscalDTOResponse {

    private Long id;
    private VendedorDTOResponse vendedor;
    private int numeroNotaFiscal;
    private String nomeEmpresa;
    private double valorNotaFiscal;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern= "dd-MM-yyyy")
    private LocalDate dataVenda;
}
