package com.dev.gestorNF.infrastructure.repository;

import com.dev.gestorNF.infrastructure.entity.out.PagamentoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PagamentoRepository
        extends JpaRepository<PagamentoEntity, Long> {

    List<PagamentoEntity>
    findByPagoEmBetween(LocalDateTime inicio, LocalDateTime fim);

    List<PagamentoEntity>
    findByAssinaturaUsuarioIdOrderByPagoEmDesc(Long usuarioId);

    Optional<PagamentoEntity>
    findFirstByAssinaturaUsuarioIdOrderByPagoEmDesc(Long usuarioId);

    void deleteByAssinaturaUsuarioId(Long usuarioId);
}