package com.dev.gestorNF.business.dto.out;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendaMensalDTOResponse {

    private Integer mes;

    private String nomeMes;

    private Double valor;
}