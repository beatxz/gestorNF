package com.dev.gestorNF.business.dto.in;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginDTORequest {

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "Informe um e-mail válido")
    @Size(max = 254, message = "O e-mail é muito longo")
    private String email;

    @NotBlank(message = "A senha é obrigatória")
    @Size(max = 72, message = "A senha é muito longa")
    private String senha;
}