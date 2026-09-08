package com.dev.gestorNF.business.dto.in;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class NotaFiscalDTORequest {

    private Long vendedorId;
    @NotNull(message = "O número da nota fiscal é obrigatório")
    @Positive(message = "O número da nota fiscal deve ser maior que zero")
    private Integer numeroNotaFiscal;

    @NotBlank(message = "O nome da empresa é obrigatório")
    @Size(max = 150, message = "O nome da empresa deve ter no máximo 150 caracteres")
    private String nomeEmpresa;

    @NotNull(message = "O valor da nota fiscal é obrigatório")
    @Positive(message = "O valor da nota fiscal deve ser maior que zero")
    private Double valorNotaFiscal;

    @Size(max = 30, message = "O código do cliente deve ter no máximo 30 caracteres")
    private String codigoCliente;

    @NotNull(message = "A data da venda é obrigatória")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    private LocalDate dataVenda;

    @Pattern(
            regexp = "^$|\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}",
            message = "Informe um CNPJ válido no formato 00.000.000/0000-00"
    )
    private String cnpj;

    @Size(max = 100, message = "O município deve ter no máximo 100 caracteres")
    private String municipio;

    @Size(max = 150, message = "A transportadora deve ter no máximo 150 caracteres")
    private String transportadora;
}

