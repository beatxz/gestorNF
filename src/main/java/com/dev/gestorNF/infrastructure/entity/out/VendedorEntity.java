package com.dev.gestorNF.infrastructure.entity.out;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "vendedor")
public class VendedorEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idVendedor;

    @Column(name = "nome", length = 100)
    private String nome;

    @Column(name = "comissao", length = 4)
    private double comissao;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private UsuarioEntity usuario;

    @OneToMany(
            mappedBy = "vendedor",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<NotaFiscalEntity> notasFiscais;
}