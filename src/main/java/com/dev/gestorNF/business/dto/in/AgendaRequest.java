
package com.dev.gestorNF.business.dto.agenda;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public record AgendaRequest(
        @NotBlank
        @Size(max = 150)
        String titulo,

        String descricao,

        @NotNull
        LocalDateTime inicio,

        LocalDateTime fim,

        @NotBlank
        @Pattern(regexp = "COMPROMISSO|TAREFA")
        String tipo,

        @NotBlank
        @Size(max = 60)
        String categoria,

        @NotBlank
        @Pattern(regexp = "#[0-9a-fA-F]{6}")
        String cor,

        boolean concluido
) {}
