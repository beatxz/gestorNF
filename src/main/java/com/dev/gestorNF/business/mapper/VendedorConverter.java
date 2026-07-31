package com.dev.gestorNF.business.mapper;

import com.dev.gestorNF.business.dto.in.VendedorDTORequest;
import com.dev.gestorNF.business.dto.out.VendedorDTOResponse;
import com.dev.gestorNF.infrastructure.entity.out.VendedorEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;


@Component
public class VendedorConverter {

    public VendedorEntity paraVendedorEntity(VendedorDTORequest vendedorDTORequest, Long idVendedor) {
        return VendedorEntity.builder()
                .idVendedor(idVendedor)
                .nome(vendedorDTORequest.getNome())
                .comissao(vendedorDTORequest.getComissao())
                .build();
    }

    public VendedorDTOResponse paraVendedorDTOResponse(VendedorEntity vendedorEntity) {
        return VendedorDTOResponse.builder()
                .id(vendedorEntity.getIdVendedor())
                .nome(vendedorEntity.getNome())
                .comissao(vendedorEntity.getComissao())
                .build();
    }

    public List<VendedorDTOResponse> paraListaVendedorDTOResponse(List<VendedorEntity> vendedorEntity) {
        List<VendedorDTOResponse> listaDTO = new ArrayList<>();
        for (  VendedorEntity vendedorEntity1 : vendedorEntity) {
            listaDTO.add(paraVendedorDTOResponse(vendedorEntity1));
        }
        return listaDTO;
    }
}