package com.dev.gestorNF.infrastructure.repository;

import com.dev.gestorNF.infrastructure.entity.out.MetaVendedorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MetaVendedorRepository
        extends JpaRepository<MetaVendedorEntity, Long> {

    Optional<MetaVendedorEntity>
    findByVendedorIdVendedorAndMes(
            Long idVendedor,
            String mes
    );

    void deleteByVendedorIdVendedor(Long idVendedor);

    void deleteByVendedorUsuarioId(Long usuarioId);
}