package com.dev.gestorNF.business.dto.in;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RedefinirSenhaDTORequest {

    @NotBlank(message = "Token de recuperação é obrigatório")
    private String token;

    @NotBlank(message = "A nova senha é obrigatória")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9\\s]).{8,}$",
            message = "A senha deve ter pelo menos 8 caracteres, incluindo letra maiúscula, letra minúscula, número e caractere especial"
    )
    private String novaSenha;
}