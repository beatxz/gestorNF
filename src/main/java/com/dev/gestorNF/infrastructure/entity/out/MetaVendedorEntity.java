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
@Table(
        name = "meta_vendedor",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_meta_vendedor_mes",
                columnNames = {"vendedor_id", "mes"}
        )
)
public class MetaVendedorEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "vendedor_id", nullable = false)
    private VendedorEntity vendedor;

    @Column(name = "mes", nullable = false, length = 7)
    private String mes;

    @Column(
            name = "valor",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal valor;
}