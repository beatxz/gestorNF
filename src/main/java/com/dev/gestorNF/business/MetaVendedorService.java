package com.dev.gestorNF.business;

import com.dev.gestorNF.business.dto.in.MetaMensalDTORequest;
import com.dev.gestorNF.business.dto.out.MetaVendedorDTOResponse;
import com.dev.gestorNF.infrastructure.entity.out.MetaVendedorEntity;
import com.dev.gestorNF.infrastructure.entity.out.NotaFiscalEntity;
import com.dev.gestorNF.infrastructure.entity.out.UsuarioEntity;
import com.dev.gestorNF.infrastructure.entity.out.VendedorEntity;
import com.dev.gestorNF.infrastructure.repository.MetaVendedorRepository;
import com.dev.gestorNF.infrastructure.repository.NotaFiscalRepository;
import com.dev.gestorNF.infrastructure.repository.UsuarioRepository;
import com.dev.gestorNF.infrastructure.repository.VendedorRepository;
import com.dev.gestorNF.infrastructure.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MetaVendedorService {

    private final MetaVendedorRepository metaVendedorRepository;
    private final VendedorRepository vendedorRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotaFiscalRepository notaFiscalRepository;
    private final JwtUtil jwtUtil;


    public MetaVendedorDTOResponse buscarMeta(
            String token,
            Long idVendedor,
            YearMonth mes
    ) {

        UsuarioEntity usuario =
                buscarUsuario(token);

        VendedorEntity vendedor =
                buscarVendedor(
                        usuario,
                        idVendedor
                );

        MetaVendedorEntity meta =
                metaVendedorRepository
                        .findByVendedorIdVendedorAndMes(
                                idVendedor,
                                mes.toString()
                        )
                        .orElse(null);

        return montarResponse(
                vendedor,
                mes,
                meta
        );
    }


    public MetaVendedorDTOResponse salvarMeta(
            String token,
            Long idVendedor,
            YearMonth mes,
            MetaMensalDTORequest request
    ) {

        UsuarioEntity usuario =
                buscarUsuario(token);

        VendedorEntity vendedor =
                buscarVendedor(
                        usuario,
                        idVendedor
                );

        MetaVendedorEntity meta =
                metaVendedorRepository
                        .findByVendedorIdVendedorAndMes(
                                idVendedor,
                                mes.toString()
                        )
                        .orElseGet(() ->
                                MetaVendedorEntity.builder()
                                        .vendedor(vendedor)
                                        .mes(mes.toString())
                                        .build()
                        );

        meta.setValor(
                request.getValor()
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        )
        );

        MetaVendedorEntity salva =
                metaVendedorRepository.save(meta);

        return montarResponse(
                vendedor,
                mes,
                salva
        );
    }


    private MetaVendedorDTOResponse montarResponse(
            VendedorEntity vendedor,
            YearMonth mes,
            MetaVendedorEntity meta
    ) {

        LocalDate inicio =
                mes.atDay(1);

        LocalDate fim =
                mes.atEndOfMonth();

        List<NotaFiscalEntity> notas =
                notaFiscalRepository
                        .findByVendedorIdVendedorOrderByDataVendaDesc(
                                vendedor.getIdVendedor()
                        );

        double vendas =
                notas.stream()
                        .filter(nota ->
                                nota.getDataVenda() != null &&
                                        !nota.getDataVenda().isBefore(inicio) &&
                                        !nota.getDataVenda().isAfter(fim)
                        )
                        .mapToDouble(
                                NotaFiscalEntity::getValorNotaFiscal
                        )
                        .sum();

        if (meta == null) {

            return MetaVendedorDTOResponse.builder()
                    .idVendedor(
                            vendedor.getIdVendedor()
                    )
                    .nomeVendedor(
                            vendedor.getNome()
                    )
                    .mes(
                            mes.toString()
                    )
                    .meta(null)
                    .vendas(vendas)
                    .percentual(null)
                    .valorRestante(null)
                    .build();
        }

        BigDecimal vendasBigDecimal =
                BigDecimal.valueOf(vendas);

        double percentual =
                vendasBigDecimal
                        .multiply(
                                BigDecimal.valueOf(100)
                        )
                        .divide(
                                meta.getValor(),
                                2,
                                RoundingMode.HALF_UP
                        )
                        .doubleValue();

        BigDecimal restante =
                meta.getValor()
                        .subtract(vendasBigDecimal)
                        .max(BigDecimal.ZERO)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );

        return MetaVendedorDTOResponse.builder()
                .idVendedor(
                        vendedor.getIdVendedor()
                )
                .nomeVendedor(
                        vendedor.getNome()
                )
                .mes(
                        mes.toString()
                )
                .meta(
                        meta.getValor()
                )
                .vendas(vendas)
                .percentual(percentual)
                .valorRestante(restante)
                .build();
    }


    private UsuarioEntity buscarUsuario(
            String token
    ) {

        String email =
                jwtUtil.extrairEmailToken(
                        token.substring(7)
                );

        return usuarioRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Usuário não encontrado"
                        )
                );
    }


    private VendedorEntity buscarVendedor(
            UsuarioEntity usuario,
            Long idVendedor
    ) {

        return vendedorRepository
                .findByIdVendedorAndUsuarioId(
                        idVendedor,
                        usuario.getId()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Vendedor não encontrado"
                        )
                );
    }
}