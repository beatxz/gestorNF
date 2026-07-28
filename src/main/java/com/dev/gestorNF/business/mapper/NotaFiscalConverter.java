package com.dev.gestorNF.business.mapper;

import com.dev.gestorNF.business.dto.in.NotaFiscalDTORequest;
import com.dev.gestorNF.business.dto.out.NotaFiscalDTOResponse;
import com.dev.gestorNF.infrastructure.entity.out.NotaFiscalEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class NotaFiscalConverter {

    private final VendedorConverter vendedorConverter;

    public NotaFiscalEntity paraNotaFiscalEntity(NotaFiscalDTORequest notaFiscalDTORequest){
        return NotaFiscalEntity.builder()
                .vendedor(notaFiscalDTORequest.getVendedorId())
                .numeroNotaFiscal(notaFiscalDTORequest.getNumeroNotaFiscal())
                .nomeEmpresa(notaFiscalDTORequest.getNomeEmpresa())
                .valorNotaFiscal(notaFiscalDTORequest.getValorNotaFiscal())
                .dataVenda(notaFiscalDTORequest.getDataVenda())
                .build();
    }
    public NotaFiscalDTOResponse paraNotaFiscalDTOResponse (NotaFiscalEntity notaFiscalEntity){
        return NotaFiscalDTOResponse.builder()
                .id(notaFiscalEntity.getId())
                .numeroNotaFiscal(notaFiscalEntity.getNumeroNotaFiscal())
                .nomeEmpresa(notaFiscalEntity.getNomeEmpresa())
                .valorNotaFiscal(notaFiscalEntity.getValorNotaFiscal())
                .dataVenda(notaFiscalEntity.getDataVenda())
                .vendedor(vendedorConverter.paraVendedorDTOResponse(notaFiscalEntity.getVendedor()))
                .build();
    }
}
