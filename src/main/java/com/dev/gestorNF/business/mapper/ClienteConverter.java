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
        clienteEntity.setCnpj(clienteDTORequest.getCnpj());
        clienteEntity.setTelefone(clienteDTORequest.getTelefone());
        clienteEntity.setMunicipio(clienteDTORequest.getMunicipio());
        clienteEntity.setTransportadora(clienteDTORequest.getTransportadora());
        clienteEntity.setVendedor(vendedorEntity);
        return clienteEntity;
    }

    public ClienteDTOResponse paraClienteDTOResponse(ClienteEntity clienteEntity) {
        return ClienteDTOResponse.builder()
                .id(clienteEntity.getId())
                .codigoCliente(clienteEntity.getCodigoCliente())
                .nomeEmpresa(clienteEntity.getNomeEmpresa())
                .cnpj(clienteEntity.getCnpj())
                .telefone(clienteEntity.getTelefone())
                .municipio(clienteEntity.getMunicipio())
                .transportadora(clienteEntity.getTransportadora())
                .idVendedor(clienteEntity.getVendedor() != null ? clienteEntity.getVendedor().getIdVendedor() : null)
                .nomeVendedor(clienteEntity.getVendedor() != null ? clienteEntity.getVendedor().getNome() : null)
                .ativo(clienteEntity.isAtivo())
                .build();
    }
}