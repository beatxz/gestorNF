package com.dev.gestorNF.business.mapper;

import com.dev.gestorNF.business.dto.in.ClienteDTORequest;
import com.dev.gestorNF.business.dto.out.ClienteDTOResponse;
import com.dev.gestorNF.infrastructure.entity.out.ClienteEntity;
import com.dev.gestorNF.infrastructure.entity.out.VendedorEntity;
import org.springframework.stereotype.Component;

@Component
public class ClienteConverter {

    public ClienteEntity paraClienteEntity(ClienteDTORequest clienteDTORequest, VendedorEntity vendedorEntity) {
        ClienteEntity clienteEntity = new ClienteEntity();
        clienteEntity.setCodigoCliente(clienteDTORequest.getCodigoCliente());
        clienteEntity.setNomeEmpresa(clienteDTORequest.getNomeEmpresa());
        clienteEntity.setVendedor(vendedorEntity);
        return clienteEntity;
    }

    public ClienteDTOResponse paraClienteDTOResponse(ClienteEntity clienteEntity) {
        return ClienteDTOResponse.builder()
                .id(clienteEntity.getId())
                .codigoCliente(clienteEntity.getCodigoCliente())
                .nomeEmpresa(clienteEntity.getNomeEmpresa())
                .ativo(clienteEntity.isAtivo())
                .build();
    }
}