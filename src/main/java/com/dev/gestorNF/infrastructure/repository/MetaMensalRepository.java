package com.dev.gestorNF.infrastructure.repository;

import com.dev.gestorNF.infrastructure.entity.out.MetaMensalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MetaMensalRepository
        extends JpaRepository<MetaMensalEntity, Long> {

    Optional<MetaMensalEntity>
    findByUsuarioIdAndMes(
            Long usuarioId,
            String mes
    );

    void deleteByUsuarioId(Long usuarioId);
}