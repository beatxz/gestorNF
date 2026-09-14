package com.dev.gestorNF.infrastructure.entity.out;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "assinatura")
public class AssinaturaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "usuario_id", nullable = false, unique = true)
    private UsuarioEntity usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AssinaturaStatus status;

    @Column(name = "inicio_teste")
    private LocalDateTime inicioTeste;

    @Column(name = "fim_teste")
    private LocalDateTime fimTeste;

    @Column(name = "valor_mensal", precision = 10, scale = 2)
    private BigDecimal valorMensal;

    @Column(name = "dia_vencimento")
    private Integer diaVencimento;

    @Column(name = "proximo_vencimento")
    private LocalDate proximoVencimento;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;
}