package com.dev.gestorNF.business.dto.out;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotaFiscalImportacaoResultadoDTOResponse {

    private Integer indice;
    private Integer numeroNotaFiscal;
    private boolean importada;
    private String erro;
}