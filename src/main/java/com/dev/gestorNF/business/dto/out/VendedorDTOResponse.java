package com.dev.gestorNF.business.dto.out;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class VendedorDTOResponse {

    private Long id;
    private String nome;
    private double comissao;
}
