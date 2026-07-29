package com.dev.gestorNF.business.mapper;

import com.dev.gestorNF.business.dto.in.UsuarioDTORequest;
import com.dev.gestorNF.business.dto.out.UsuarioDTOResponse;
import com.dev.gestorNF.infrastructure.entity.out.UsuarioEntity;
import org.springframework.stereotype.Component;

@Component
public class UsuarioConverter {

    public UsuarioEntity paraUsuarioEntity(UsuarioDTORequest usuarioDTORequest){
        return UsuarioEntity.builder()
                .email(usuarioDTORequest.getEmail())
                .nome(usuarioDTORequest.getNome())
                .senha(usuarioDTORequest.getSenha())
                .build();
    }

    public UsuarioDTOResponse paraUsuarioDTOResponse (UsuarioEntity entity){
        return UsuarioDTOResponse.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .nome(entity.getNome())
                .senha(entity.getSenha())
                .build();
    }


}
