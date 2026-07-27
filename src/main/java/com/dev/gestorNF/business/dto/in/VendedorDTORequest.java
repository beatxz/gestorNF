package com.dev.gestorNF.business.dto.in;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class VendedorDTORequest {

    private String nome;
    private double comissao;

}
