package com.dev.gestorNF.business.dto.out;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminResumoDTOResponse {

    private long totalClientes;

    private long clientesEmTeste;

    private long clientesAtivos;

    private long clientesSuspensos;

    private BigDecimal faturamentoPrevisto;

    private BigDecimal recebidoNoMes;

    private BigDecimal aReceber;

    private BigDecimal emAtraso;
}