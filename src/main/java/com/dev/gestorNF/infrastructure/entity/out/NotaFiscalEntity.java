package com.dev.gestorNF.infrastructure.entity.out;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "nota_fiscal")
public class NotaFiscalEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;
    @Column(name= "numeroNotaFiscal",length = 100)
    private int numeroNotaFiscal;
    @Column(name= "nomeEmpresa",length = 100)
    private String nomeEmpresa;
    @Column(name= "valorNotaFiscal",length = 100)
    private double valorNotaFiscal;
    @Column(name= "dataVenda")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern= "dd-MM-yyyy")
    private LocalDate dataVenda;
    @Column(name = "codigo_cliente", length = 30)
    private String codigoCliente;

    @ManyToOne
    @JoinColumn(name = "vendedor_id")
    private VendedorEntity vendedor;

    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private ClienteEntity cliente;

}
