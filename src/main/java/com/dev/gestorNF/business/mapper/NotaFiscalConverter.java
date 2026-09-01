package com.dev.gestorNF.business.mapper;

import com.dev.gestorNF.business.dto.in.NotaFiscalDTORequest;
import com.dev.gestorNF.business.dto.out.NotaFiscalDTOResponse;
import com.dev.gestorNF.infrastructure.entity.out.NotaFiscalEntity;
import com.dev.gestorNF.infrastructure.entity.out.VendedorEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class NotaFiscalConverter {

    private final VendedorConverter vendedorConverter;

    public NotaFiscalEntity paraNotaFiscalEntity(NotaFiscalDTORequest notaFiscalDTORequest, VendedorEntity vendedorEntity, String nomeEmpresaResolvido){
        return NotaFiscalEntity.builder()
                .numeroNotaFiscal(notaFiscalDTORequest.getNumeroNotaFiscal())
                .nomeEmpresa(nomeEmpresaResolvido)
                .valorNotaFiscal(notaFiscalDTORequest.getValorNotaFiscal())
                .dataVenda(notaFiscalDTORequest.getDataVenda())
                .vendedor(vendedorEntity)
                .codigoCliente(notaFiscalDTORequest.getCodigoCliente())
                .build();
    }
    public NotaFiscalDTOResponse paraNotaFiscalDTOResponse (NotaFiscalEntity notaFiscalEntity){
        return NotaFiscalDTOResponse.builder()
                .id(notaFiscalEntity.getId())
                .numeroNotaFiscal(notaFiscalEntity.getNumeroNotaFiscal())
                .codigoCliente(notaFiscalEntity.getCodigoCliente())
                .nomeEmpresa(notaFiscalEntity.getNomeEmpresa())
                .valorNotaFiscal(notaFiscalEntity.getValorNotaFiscal())
                .dataVenda(notaFiscalEntity.getDataVenda())
                .vendedor(vendedorConverter.paraVendedorDTOResponse(notaFiscalEntity.getVendedor()))
                .build();
    }
}
