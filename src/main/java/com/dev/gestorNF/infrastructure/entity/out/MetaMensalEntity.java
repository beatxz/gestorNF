package com.dev.gestorNF.infrastructure.entity.out;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "meta_mensal",
        uniqueConstraints = @UniqueConstraint(name = "uk_meta_usuario_mes", columnNames = {"usuario_id", "mes"})
)
public class MetaMensalEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private UsuarioEntity usuario;

    @Column(name = "mes", nullable = false, length = 7)
    private String mes;

    @Column(name = "valor", nullable = false, precision = 12, scale = 2)
    private BigDecimal valor;
}