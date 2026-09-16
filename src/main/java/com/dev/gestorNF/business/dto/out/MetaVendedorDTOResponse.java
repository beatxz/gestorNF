package com.dev.gestorNF.business.dto.out;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetaVendedorDTOResponse {

    private Long idVendedor;

    private String nomeVendedor;

    private String mes;

    private BigDecimal meta;

    private Double vendas;

    private Double percentual;

    private BigDecimal valorRestante;
}