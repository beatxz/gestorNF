package com.dev.gestorNF.infrastructure.repository;

import com.dev.gestorNF.infrastructure.entity.out.ConviteEntity;
import com.dev.gestorNF.infrastructure.entity.out.ConviteStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConviteRepository extends JpaRepository<ConviteEntity, Long> {

    Optional<ConviteEntity> findByToken(String token);

    Optional<ConviteEntity> findByEmailAndStatus(String email, ConviteStatus status);

    List<ConviteEntity> findAllByOrderByCriadoEmDesc();
}