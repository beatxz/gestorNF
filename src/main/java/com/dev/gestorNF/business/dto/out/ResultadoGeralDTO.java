package com.dev.gestorNF.business.dto.out;

import lombok.*;

import java.time.YearMonth;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ResultadoGeralDTO {

    private YearMonth mes;

    private Double comissaoTotalEmpresa;

    private Double vendasTotais;

    private Double comissoesVendedores;

    private Double comissaoUsuario;

    private List<ResultadoGeralVendedorDTO> vendedores;
}