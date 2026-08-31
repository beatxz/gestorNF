package com.dev.gestorNF.business.dto.in;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClienteDTORequest {
    private String codigoCliente;
    private String nomeEmpresa;
}