package com.dev.gestorNF.business.dto.out;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ClienteDTOResponse {

    private Long id;
    private String codigoCliente;
    private String nomeEmpresa;
    private String cnpj;
    private String telefone;
    private String municipio;
    private String transportadora;
    private Long idVendedor;
    private String nomeVendedor;
    private boolean ativo;
}
