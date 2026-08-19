package com.dev.gestorNF.infrastructure.repository;

import com.dev.gestorNF.infrastructure.entity.out.NotaFiscalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotaFiscalRepository extends JpaRepository<NotaFiscalEntity,Long> {

    Boolean existsByNumeroNotaFiscal(int numeroNotaFiscal);

    Optional<NotaFiscalEntity> findByNumeroNotaFiscalAndVendedorIdVendedor(int numeroNotaFiscal, Long idVendedor);

    List<NotaFiscalEntity> findByVendedorIdVendedor(Long idVendedor);

    Optional<NotaFiscalEntity> findByNumeroNotaFiscal(int numeroNotaFiscal);

    @Transactional
    void deleteByNumeroNotaFiscal(int numeroNotaFiscal);
}
