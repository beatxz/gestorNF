package com.dev.gestorNF.business.dto.in;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClienteDTORequest {

    @Size(max = 30, message = "O código do cliente deve ter no máximo 30 caracteres")
    private String codigoCliente;

    @NotBlank(message = "O nome da empresa é obrigatório")
    @Size(max = 150, message = "O nome da empresa deve ter no máximo 150 caracteres")
    private String nomeEmpresa;

    @Pattern(
            regexp = "^$|\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}|\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}",
            message = "Informe um CPF ou CNPJ válido"
    )
    private String cnpj;

    @Size(max = 255, message = "Os telefones devem ter no máximo 255 caracteres")
    private String telefone;

    @Size(max = 2000, message = "A observação deve ter no máximo 2000 caracteres")
    private String observacao;

    @Size(max = 100, message = "O município deve ter no máximo 100 caracteres")
    private String municipio;

    @Size(max = 150, message = "A transportadora deve ter no máximo 150 caracteres")
    private String transportadora;
}