package com.dev.gestorNF.infrastructure.repository;

import com.dev.gestorNF.infrastructure.entity.out.UsuarioEntity;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<UsuarioEntity,Long> {

    Boolean existsByEmail(String email);

     Optional<UsuarioEntity> findByEmail(String email);

    Optional<UsuarioEntity> findByTokenVerificacao(String tokenVerificacao);


    @Transactional
     void deleteByEmail(String email);
}
