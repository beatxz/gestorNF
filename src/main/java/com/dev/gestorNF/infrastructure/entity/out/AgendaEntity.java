
package com.dev.gestorNF.infrastructure.entity.out;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "agenda_evento", indexes = {
        @Index(name = "idx_agenda_usuario_inicio",
                columnList = "usuario_id,inicio")
})
@Getter
@Setter
public class AgendaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    private UsuarioEntity usuario;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(nullable = false)
    private LocalDateTime inicio;

    private LocalDateTime fim;

    @Column(nullable = false, length = 20)
    private String tipo;

    @Column(nullable = false, length = 60)
    private String categoria;

    @Column(nullable = false, length = 7)
    private String cor;

    @Column(nullable = false)
    private boolean concluido = false;
}
