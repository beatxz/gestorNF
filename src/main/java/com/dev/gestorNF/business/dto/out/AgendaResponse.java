package com.dev.gestorNF.business.dto.out;

import java.time.LocalDateTime;

public record AgendaResponse(
        Long id,
        String titulo,
        String descricao,
        LocalDateTime inicio,
        LocalDateTime fim,
        String tipo,
        String categoria,
        String cor,
        boolean concluido
) {}
