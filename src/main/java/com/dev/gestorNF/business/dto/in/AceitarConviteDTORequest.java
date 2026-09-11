package com.dev.gestorNF.business.dto.in;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AceitarConviteDTORequest {

    @NotBlank(message = "O token do convite é obrigatório")
    private String token;

    @NotBlank(message = "O nome é obrigatório")
    @Size(min = 2, max = 100, message = "O nome deve ter entre 2 e 100 caracteres")
    private String nome;

    @NotBlank(message = "A senha é obrigatória")
    @Size(max = 72, message = "A senha é muito longa")
    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9\\s]).{8,}$",
            message = "A senha deve ter pelo menos 8 caracteres, incluindo letra maiúscula, letra minúscula, número e caractere especial"
    )
    private String senha;

    @AssertTrue(message = "Você precisa aceitar os Termos de Uso")
    private boolean aceitouTermos;

    @AssertTrue(message = "Você precisa declarar ciência da Política de Privacidade")
    private boolean cientePoliticaPrivacidade;
}