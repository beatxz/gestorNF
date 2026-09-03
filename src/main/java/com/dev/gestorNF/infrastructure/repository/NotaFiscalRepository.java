package com.dev.gestorNF.infrastructure.repository;

import com.dev.gestorNF.infrastructure.entity.out.NotaFiscalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface NotaFiscalRepository extends JpaRepository<NotaFiscalEntity,Long> {

    Boolean existsByNumeroNotaFiscalAndVendedorUsuarioId(int numeroNotaFiscal,Long usuarioId);

    Optional<NotaFiscalEntity> findByNumeroNotaFiscalAndVendedorIdVendedor(int numeroNotaFiscal, Long idVendedor);

    Boolean existsByNumeroNotaFiscalAndVendedorUsuarioIdAndIdNot(int numeroNotaFiscal, Long usuarioId, Long id);

    Optional<NotaFiscalEntity> findByIdAndVendedorUsuarioId(Long id, Long usuarioId);

    List<NotaFiscalEntity> findByVendedorIdVendedor(Long idVendedor);

    Optional<NotaFiscalEntity> findByNumeroNotaFiscalAndVendedorUsuarioId(int numeroNotaFiscal,Long usuarioId);

    List<NotaFiscalEntity>
    findByVendedorUsuarioIdAndDataVendaBetweenOrderByDataVendaAsc(Long usuarioId, LocalDate inicio, LocalDate fim);

    List<NotaFiscalEntity>
    findByVendedorIdVendedorAndDataVendaBetweenOrderByDataVendaAsc(Long idVendedor, LocalDate inicio, LocalDate fim);
}
