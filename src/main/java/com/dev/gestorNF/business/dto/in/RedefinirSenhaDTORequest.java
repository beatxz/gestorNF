package com.dev.gestorNF.business.dto.in;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RedefinirSenhaDTORequest {

    private String token;
    private String novaSenha;
}