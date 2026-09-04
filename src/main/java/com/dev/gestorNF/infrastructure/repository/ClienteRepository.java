package com.dev.gestorNF.infrastructure.repository;

import com.dev.gestorNF.infrastructure.entity.out.ClienteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<ClienteEntity, Long> {



    Optional<ClienteEntity> findByCodigoClienteAndVendedorIdVendedor(String codigoCliente, Long idVendedor);

    List<ClienteEntity> findByVendedorIdVendedor(Long idVendedor);

    Optional<ClienteEntity> findByIdAndVendedorIdVendedor(Long id, Long idVendedor);
}