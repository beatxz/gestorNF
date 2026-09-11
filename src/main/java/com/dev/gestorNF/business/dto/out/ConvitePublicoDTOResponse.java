package com.dev.gestorNF.business.dto.out;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ConvitePublicoDTOResponse {

    private String email;

    private LocalDateTime expiraEm;
}