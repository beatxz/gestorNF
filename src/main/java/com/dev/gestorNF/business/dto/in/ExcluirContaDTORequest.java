package com.dev.gestorNF.business.dto.in;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExcluirContaDTORequest {

    @NotBlank(message = "Informe sua senha para excluir a conta")
    @Size(max = 72, message = "Senha inválida")
    private String senha;
}