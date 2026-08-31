package com.dev.gestorNF.infrastructure.entity.out;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
        name = "cliente",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_cliente_codigo_vendedor",
                columnNames = {"codigo_cliente", "vendedor_id"}
        )
)
@Getter
@Setter
public class ClienteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_cliente", length = 30)
    private String codigoCliente;

    @Column(name = "nome_empresa", length = 150)
    private String nomeEmpresa;

    @Column(name = "ativo")
    private boolean ativo = true;

    @ManyToOne
    @JoinColumn(name = "vendedor_id")
    private VendedorEntity vendedor;
}