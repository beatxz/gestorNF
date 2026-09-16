package com.dev.gestorNF.business;

import com.dev.gestorNF.business.dto.in.MetaMensalDTORequest;
import com.dev.gestorNF.business.dto.out.MetaMensalDTOResponse;
import com.dev.gestorNF.infrastructure.entity.out.MetaMensalEntity;
import com.dev.gestorNF.infrastructure.entity.out.NotaFiscalEntity;
import com.dev.gestorNF.infrastructure.entity.out.UsuarioEntity;
import com.dev.gestorNF.infrastructure.repository.MetaMensalRepository;
import com.dev.gestorNF.infrastructure.repository.NotaFiscalRepository;
import com.dev.gestorNF.infrastructure.repository.UsuarioRepository;
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
public class MetaMensalService {

    private final MetaMensalRepository metaMensalRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotaFiscalRepository notaFiscalRepository;
    private final JwtUtil jwtUtil;


    public MetaMensalDTOResponse buscarMeta(
            String token,
            YearMonth mes
    ) {

        UsuarioEntity usuario =
                buscarUsuario(token);

        MetaMensalEntity meta =
                metaMensalRepository
                        .findByUsuarioIdAndMes(
                                usuario.getId(),
                                mes.toString()
                        )
                        .orElse(null);

        return montarResponse(
                usuario,
                mes,
                meta
        );
    }


    public MetaMensalDTOResponse salvarMeta(
            String token,
            YearMonth mes,
            MetaMensalDTORequest request
    ) {

        UsuarioEntity usuario =
                buscarUsuario(token);

        MetaMensalEntity meta =
                metaMensalRepository
                        .findByUsuarioIdAndMes(
                                usuario.getId(),
                                mes.toString()
                        )
                        .orElseGet(
                                () ->
                                        MetaMensalEntity.builder()
                                                .usuario(usuario)
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

        MetaMensalEntity salva =
                metaMensalRepository.save(meta);

        return montarResponse(
                usuario,
                mes,
                salva
        );
    }


    private MetaMensalDTOResponse montarResponse(
            UsuarioEntity usuario,
            YearMonth mes,
            MetaMensalEntity meta
    ) {

        LocalDate inicio =
                mes.atDay(1);

        LocalDate fim =
                mes.atEndOfMonth();

        List<NotaFiscalEntity> notas =
                notaFiscalRepository
                        .findByVendedorUsuarioIdAndDataVendaBetweenOrderByDataVendaAsc(
                                usuario.getId(),
                                inicio,
                                fim
                        );

        double vendas =
                notas.stream()
                        .mapToDouble(
                                NotaFiscalEntity::getValorNotaFiscal
                        )
                        .sum();

        if (meta == null) {

            return MetaMensalDTOResponse.builder()
                    .mes(mes.toString())
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

        return MetaMensalDTOResponse.builder()
                .mes(mes.toString())
                .meta(meta.getValor())
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
}