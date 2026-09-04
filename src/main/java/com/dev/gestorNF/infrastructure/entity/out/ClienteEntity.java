package com.dev.gestorNF.infrastructure.entity.out;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "cliente")
@Getter
@Setter
public class ClienteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_cliente", length = 30, unique = true)
    private String codigoCliente;

    @Column(name = "nome_empresa", length = 150)
    private String nomeEmpresa;

    @Column(name = "cnpj", length = 20)
    private String cnpj;

    @Column(name = "telefone", length = 20)
    private String telefone;

    @Column(name = "municipio", length = 100)
    private String municipio;

    @Column(name = "transportadora", length = 150)
    private String transportadora;

    @Column(name = "ativo")
    private boolean ativo = true;

    @ManyToOne
    @JoinColumn(name = "vendedor_id")
    private VendedorEntity vendedor;
}