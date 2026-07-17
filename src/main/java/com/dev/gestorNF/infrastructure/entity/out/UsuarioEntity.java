package com.dev.gestorNF.infrastructure.entity.out;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Builder
@Table(name = "usuario")
public class UsuarioEntity {

    @Id
    @GeneratedValue
    private Long id;
    @Column(name= "nome", length = 100)
    private String nome;
    @Column(name = "nome",length = 100)
    private String email;
    @Column(name = "nome", length = 20)
    private String senha;

    @OneToMany(mappedBy = "usuario")
    private List<VendedorEntity> vendedor;
}
