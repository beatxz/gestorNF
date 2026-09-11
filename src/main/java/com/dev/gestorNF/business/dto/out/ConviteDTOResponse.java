package com.dev.gestorNF.business.dto.out;

import com.dev.gestorNF.infrastructure.entity.out.ConviteStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ConviteDTOResponse {

    private Long id;

    private String email;

    private ConviteStatus status;

    private LocalDateTime criadoEm;

    private LocalDateTime expiraEm;

    private LocalDateTime aceitoEm;
}