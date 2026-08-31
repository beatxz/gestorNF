package com.dev.gestorNF.infrastructure.repository;

import com.dev.gestorNF.infrastructure.entity.out.VendedorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VendedorRepository extends JpaRepository<VendedorEntity,Long> {

    List<VendedorEntity> findByUsuarioEmail(String email);

    Optional<VendedorEntity> findByIdVendedorAndUsuarioId(Long idVendedor, Long usuarioId);

}
