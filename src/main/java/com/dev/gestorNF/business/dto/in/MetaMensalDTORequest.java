package com.dev.gestorNF.business.dto.in;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MetaMensalDTORequest {

    @NotNull(message = "Informe o valor da meta")
    @DecimalMin(
            value = "0.01",
            message = "A meta deve ser maior que zero"
    )
    private BigDecimal valor;
}