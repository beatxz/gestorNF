package com.dev.gestorNF.infrastructure.repository;

import com.dev.gestorNF.infrastructure.entity.out.NotaFiscalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotaFiscalRepository extends JpaRepository<NotaFiscalEntity,Long> {
}
