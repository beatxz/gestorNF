package com.dev.gestorNF.business.dto.in;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class VendedorDTORequest {

    @NotBlank(message = "O nome do vendedor é obrigatório")
    @Size(min = 2, max = 100, message = "O nome do vendedor deve ter entre 2 e 100 caracteres")
    private String nome;

    @NotNull(message = "A comissão é obrigatória")
    @DecimalMin(value = "0.0", inclusive = true, message = "A comissão não pode ser negativa")
    @DecimalMax(value = "100.0", inclusive = true, message = "A comissão não pode ser maior que 100%")
    private Double comissao;
}

