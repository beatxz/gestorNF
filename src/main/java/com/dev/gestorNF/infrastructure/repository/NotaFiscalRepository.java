package com.dev.gestorNF.infrastructure.repository;

import com.dev.gestorNF.infrastructure.entity.out.NotaFiscalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotaFiscalRepository extends JpaRepository<NotaFiscalEntity,Long> {

    Boolean existsByNumeroNotaFiscalAndVendedorUsuarioId(int numeroNotaFiscal,Long usuarioId);

    Optional<NotaFiscalEntity> findByNumeroNotaFiscalAndVendedorIdVendedor(int numeroNotaFiscal, Long idVendedor);

    List<NotaFiscalEntity> findByVendedorIdVendedor(Long idVendedor);

    Optional<NotaFiscalEntity> findByNumeroNotaFiscalAndVendedorUsuarioId(int numeroNotaFiscal,Long usuarioId);

}
