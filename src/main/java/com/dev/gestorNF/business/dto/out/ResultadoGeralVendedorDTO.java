package com.dev.gestorNF.business.dto.out;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ResultadoGeralVendedorDTO {

    private Long idVendedor;
    private String nomeVendedor;

    private Double totalVendas;

    private Double percentualComissaoVendedor;
    private Double comissaoVendedor;

    private Double percentualComissaoUsuario;
    private Double comissaoUsuario;
}