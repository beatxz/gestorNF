package com.dev.gestorNF.infrastructure.repository;

import com.dev.gestorNF.infrastructure.entity.out.AssinaturaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AssinaturaRepository
        extends JpaRepository<AssinaturaEntity, Long> {

    Optional<AssinaturaEntity> findByUsuarioId(Long usuarioId);

    Optional<AssinaturaEntity> findByUsuarioEmail(String email);

    void deleteByUsuarioId(Long usuarioId);
}