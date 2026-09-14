package com.dev.gestorNF.business.dto.out;

import com.dev.gestorNF.infrastructure.entity.out.AssinaturaStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminClienteDTOResponse {

    private Long usuarioId;

    private String nome;

    private String email;

    private AssinaturaStatus status;

    private LocalDateTime inicioTeste;

    private LocalDateTime fimTeste;

    private Long minutosRestantesTeste;

    private BigDecimal valorMensal;

    private Integer diaVencimento;

    private LocalDate proximoVencimento;

    private long quantidadeVendedores;

    private long quantidadeClientes;

    private long quantidadeNotas;
}