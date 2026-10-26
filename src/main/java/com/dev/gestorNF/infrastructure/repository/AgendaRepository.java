
package com.dev.gestorNF.infrastructure.repository;

import com.dev.gestorNF.infrastructure.entity.out.AgendaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AgendaRepository extends JpaRepository<AgendaEntity, Long> {

    @Query("""
        SELECT e FROM AgendaEntity e
        WHERE e.usuario.id = :usuarioId
          AND e.inicio < :fim
          AND (e.fim IS NULL OR e.fim >= :inicio)
        ORDER BY e.inicio ASC, e.id ASC
        """)
    List<AgendaEntity> buscarEventosNoPeriodo(
            @Param("usuarioId") Long usuarioId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );

    Optional<AgendaEntity> findByIdAndUsuarioId(
            Long id,
            Long usuarioId
    );
}
