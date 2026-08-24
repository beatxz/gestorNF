package com.dev.gestorNF.business.mapper;


import com.dev.gestorNF.business.dto.in.UsuarioDTORequest;
import com.dev.gestorNF.business.dto.out.UsuarioDTOResponse;
import com.dev.gestorNF.infrastructure.entity.out.UsuarioEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class UsuarioConverter {

    public UsuarioEntity paraUsuarioEntity(UsuarioDTORequest usuarioDTORequest) {

        return UsuarioEntity.builder()
                .email(usuarioDTORequest.getEmail())
                .nome(usuarioDTORequest.getNome())
                .senha(usuarioDTORequest.getSenha())
                .emailVerificado(false)
                .build();
    }

    public UsuarioDTOResponse paraUsuarioDTOResponse(UsuarioEntity entity) {

        return UsuarioDTOResponse.builder()
                .id(entity.getId())
                .email(entity.getEmail())
                .nome(entity.getNome())
                .emailVerificado(entity.isEmailVerificado())
                .build();
    }

    public List<UsuarioDTOResponse> paraListaUsuarioDTOResponse(
            List<UsuarioEntity> listaUsuarioEntity) {

        List<UsuarioDTOResponse> listaDTO = new ArrayList<>();

        for (UsuarioEntity usuarioEntity : listaUsuarioEntity) {
            listaDTO.add(paraUsuarioDTOResponse(usuarioEntity));
        }

        return listaDTO;
    }
}