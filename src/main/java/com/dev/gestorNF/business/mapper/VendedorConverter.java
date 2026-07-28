package com.dev.gestorNF.business.mapper;

import com.dev.gestorNF.business.dto.in.VendedorDTORequest;
import com.dev.gestorNF.business.dto.out.VendedorDTOResponse;
import com.dev.gestorNF.infrastructure.entity.out.VendedorEntity;
import org.springframework.stereotype.Component;


@Component
public class VendedorConverter {

    public VendedorEntity paraVendedorEntity (VendedorDTORequest vendedorDTORequest){
        return VendedorEntity.builder()
                .nome(vendedorDTORequest.getNome())
                .comissao(vendedorDTORequest.getComissao())
                .build();
    }
    public VendedorDTOResponse paraVendedorDTOResponse (VendedorEntity vendedorEntity){
        return VendedorDTOResponse.builder()
                .id(vendedorEntity.getId())
                .nome(vendedorEntity.getNome())
                .comissao(vendedorEntity.getComissao())
                .build();
    }
}
