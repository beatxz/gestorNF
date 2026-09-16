package com.dev.gestorNF.business.dto.out;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendaDiariaDTOResponse {

    private LocalDate data;

    private Double valorDia;

    private Double valorAcumulado;
}