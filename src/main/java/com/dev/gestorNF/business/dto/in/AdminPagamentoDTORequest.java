package com.dev.gestorNF.business.dto.in;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class AdminPagamentoDTORequest {

    @NotNull(message = "Informe o valor pago")
    @DecimalMin(
            value = "0.01",
            message = "O valor pago deve ser maior que zero"
    )
    private BigDecimal valorPago;
}