package com.dev.gestorNF.business.dto.in;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class AdminAssinaturaDTORequest {

    @NotNull(message = "Informe o valor mensal")
    @DecimalMin(value = "0.01", message = "O valor mensal deve ser maior que zero")
    private BigDecimal valorMensal;
    @NotNull(message = "Informe o dia do vencimento")
    @Min(value = 1, message = "O dia do vencimento deve ser entre 1 e 31")
    @Max(value = 31, message = "O dia do vencimento deve ser entre 1 e 31")
    private Integer diaVencimento;
}