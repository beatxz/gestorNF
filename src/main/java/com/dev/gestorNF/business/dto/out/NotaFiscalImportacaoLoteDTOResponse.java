package com.dev.gestorNF.business.dto.out;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotaFiscalImportacaoLoteDTOResponse {

    private String nomeArquivo;
    private NotaFiscalImportacaoDTOResponse nota;
    private boolean valida;
    private String erro;
}