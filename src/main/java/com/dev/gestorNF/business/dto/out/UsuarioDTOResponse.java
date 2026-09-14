package com.dev.gestorNF.business.dto.out;

import com.dev.gestorNF.infrastructure.entity.out.UsuarioRole;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class UsuarioDTOResponse {

    private Long id;
    private String nome;
    private String email;
    private boolean emailVerificado;
    private Double comissaoTotal;
    private UsuarioRole role;

}
