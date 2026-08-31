package com.dev.gestorNF.infrastructure.entity.out;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
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

    @Column(name = "email", length = 100, nullable = false, unique = true)
    private String email;

    @Column(name = "senha", nullable = false)
    private String senha;

    @Column(name = "emailVerificado")
    private boolean emailVerificado;

    @Column(name = "tokenVerificacao")
    private String tokenVerificacao;

    @Column(name= "tokenRecuperacaoSenha")
    private String tokenRecuperacaoSenha;

    @Column(name= "expiracaoTokenRecuperacao")
    private LocalDateTime expiracaoTokenRecuperacao ;

    @Builder.Default
    @Column(name = "tentativas_login_falhas")
    private Integer tentativasLoginFalhas = 0;

    @Column(name = "bloqueado_ate")
    private LocalDateTime bloqueadoAte;

    @Builder.Default
    @Column(name = "tentativas_recuperacao")
    private Integer tentativasRecuperacao = 0;

    @Column(name = "inicio_janela_recuperacao")
    private LocalDateTime inicioJanelaRecuperacao;


    @OneToMany(mappedBy = "usuario")
    private List<VendedorEntity> vendedor;
}
