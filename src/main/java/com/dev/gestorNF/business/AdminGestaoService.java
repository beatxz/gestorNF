package com.dev.gestorNF.business;

import com.dev.gestorNF.business.dto.in.AdminAssinaturaDTORequest;
import com.dev.gestorNF.business.dto.in.AdminPagamentoDTORequest;
import com.dev.gestorNF.business.dto.out.AdminClienteDTOResponse;
import com.dev.gestorNF.business.dto.out.AdminResumoDTOResponse;
import com.dev.gestorNF.infrastructure.entity.out.*;
import com.dev.gestorNF.infrastructure.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminGestaoService {

    private final UsuarioRepository usuarioRepository;
    private final AssinaturaRepository assinaturaRepository;
    private final VendedorRepository vendedorRepository;
    private final ClienteRepository clienteRepository;
    private final NotaFiscalRepository notaFiscalRepository;
    private final PagamentoRepository pagamentoRepository;

    @Transactional(readOnly = true)
    public List<AdminClienteDTOResponse> listarClientes() {

        return usuarioRepository
                .findByRoleOrderByNomeAsc(UsuarioRole.USER)
                .stream()
                .map(this::paraClienteResponse)
                .toList();
    }


    @Transactional(readOnly = true)
    public AdminResumoDTOResponse buscarResumo() {

        List<AssinaturaEntity> assinaturas =
                assinaturaRepository.findAll();

        long totalClientes =
                usuarioRepository
                        .findByRoleOrderByNomeAsc(UsuarioRole.USER).size();

        long emTeste =
                assinaturas.stream().filter(a ->
                                a.getStatus() == AssinaturaStatus.EM_TESTE).count();
        long ativos =
                assinaturas.stream().filter(a -> a.getStatus() ==
                                        AssinaturaStatus.ATIVO).count();

        long suspensos =
                assinaturas.stream().filter(a ->
                                a.getStatus() == AssinaturaStatus.SUSPENSO).count();


        BigDecimal faturamentoPrevisto =
                assinaturas.stream()
                        .filter(a -> a.getStatus() == AssinaturaStatus.ATIVO)
                        .map(AssinaturaEntity::getValorMensal)
                        .filter(valor ->
                                valor != null)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);


        YearMonth mesAtual = YearMonth.now();

        LocalDateTime inicioMes = mesAtual
                        .atDay(1)
                        .atStartOfDay();

        LocalDateTime inicioProximoMes =
                mesAtual
                        .plusMonths(1)
                        .atDay(1)
                        .atStartOfDay();


        BigDecimal recebidoNoMes =
                pagamentoRepository
                        .findByPagoEmBetween(inicioMes, inicioProximoMes
                        )
                        .stream()
                        .map(
                                PagamentoEntity::getValor)
                        .filter(valor -> valor != null)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);


        BigDecimal aReceber =
                faturamentoPrevisto.subtract(recebidoNoMes);

        if (aReceber.signum() < 0) {
            aReceber = BigDecimal.ZERO;
        }


        LocalDate hoje =
                LocalDate.now();

        BigDecimal emAtraso = assinaturas.stream()
                        .filter(a -> a.getStatus() == AssinaturaStatus.ATIVO)
                        .filter(a -> a.getProximoVencimento() != null)
                        .filter(a -> a.getProximoVencimento().isBefore(hoje))
                .map(AssinaturaEntity::getValorMensal
                        )
                        .filter(valor -> valor != null)
                        .reduce(
                                BigDecimal.ZERO,
                                BigDecimal::add
                        );


        return AdminResumoDTOResponse.builder()
                .totalClientes(totalClientes)
                .clientesEmTeste(emTeste)
                .clientesAtivos(ativos)
                .clientesSuspensos(suspensos)

                .faturamentoPrevisto(faturamentoPrevisto)

                .recebidoNoMes(recebidoNoMes)

                .aReceber(aReceber)

                .emAtraso(emAtraso)

                .build();
    }

    private AdminClienteDTOResponse paraClienteResponse(
            UsuarioEntity usuario) {

        AssinaturaEntity assinatura =
                assinaturaRepository.findByUsuarioId(usuario.getId())
                        .orElse(null);
        Long minutosRestantes = null;

        if (
                assinatura != null && assinatura.getStatus() ==
                                AssinaturaStatus.EM_TESTE && assinatura.getFimTeste() != null) {

            LocalDateTime agora = LocalDateTime.now();

            if (assinatura.getFimTeste().isAfter(agora)) {

                minutosRestantes =
                        Duration.between(agora, assinatura.getFimTeste()).toMinutes();

            } else {

                minutosRestantes = 0L;
            }
        }

        return AdminClienteDTOResponse.builder()
                .usuarioId(usuario.getId())
                .nome(usuario.getNome())
                .email(usuario.getEmail())

                .status(assinatura != null ? assinatura.getStatus() : null)

                .inicioTeste(assinatura != null ? assinatura.getInicioTeste() : null)

                .fimTeste(assinatura != null ? assinatura.getFimTeste() : null)

                .minutosRestantesTeste(minutosRestantes)

                .valorMensal(assinatura != null ? assinatura.getValorMensal() : null)

                .diaVencimento(assinatura != null ? assinatura.getDiaVencimento() : null)

                .proximoVencimento(assinatura != null ? assinatura.getProximoVencimento() : null)

                .quantidadeVendedores(
                        vendedorRepository.countByUsuarioId(usuario.getId()))

                .quantidadeClientes(clienteRepository.countByVendedorUsuarioId(usuario.getId()))

                .quantidadeNotas(notaFiscalRepository.countByVendedorUsuarioId(usuario.getId()))
                .build();
    }
    @Transactional
    public AdminClienteDTOResponse configurarAssinatura(Long usuarioId, AdminAssinaturaDTORequest request) {

        UsuarioEntity usuario = usuarioRepository
                .findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado"));

        if (usuario.getRole() != UsuarioRole.USER) {
            throw new IllegalArgumentException("A assinatura só pode ser configurada para clientes");
        }

        AssinaturaEntity assinatura =
                assinaturaRepository
                        .findByUsuarioId(usuarioId)
                        .orElseGet(() ->
                                AssinaturaEntity.builder()
                                        .usuario(usuario)
                                        .criadoEm(LocalDateTime.now())
                                        .build()
                        );

        assinatura.setStatus(AssinaturaStatus.ATIVO);

        assinatura.setValorMensal(request.getValorMensal());

        assinatura.setDiaVencimento(request.getDiaVencimento());

        assinatura.setProximoVencimento(calcularProximoVencimento(request.getDiaVencimento()));

        assinaturaRepository.save(assinatura);

        return paraClienteResponse(usuario);
    }
    @Transactional
    public AdminClienteDTOResponse suspenderAssinatura(Long usuarioId) {

        UsuarioEntity usuario = usuarioRepository.findById(usuarioId).orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado"));

        AssinaturaEntity assinatura = assinaturaRepository
                        .findByUsuarioId(usuarioId).orElseThrow(() -> new IllegalArgumentException("Este cliente ainda não possui assinatura"));

        assinatura.setStatus(AssinaturaStatus.SUSPENSO);

        assinaturaRepository.save(assinatura);

        return paraClienteResponse(usuario);
    }
    private LocalDate calcularProximoVencimento(Integer diaVencimento) {

        LocalDate hoje = LocalDate.now();

        YearMonth mesAtual = YearMonth.from(hoje);

        int diaValidoMesAtual = Math.min(diaVencimento, mesAtual.lengthOfMonth());

        LocalDate vencimento = mesAtual.atDay(diaValidoMesAtual);

        if (!vencimento.isAfter(hoje)) {

            YearMonth proximoMes = mesAtual.plusMonths(1);

            int diaValidoProximoMes = Math.min(diaVencimento, proximoMes.lengthOfMonth());

            vencimento =
                    proximoMes.atDay(diaValidoProximoMes);
        }

        return vencimento;
    }
    @Transactional
    public AdminClienteDTOResponse reativarAssinatura(Long usuarioId) {

        UsuarioEntity usuario = usuarioRepository
                .findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado"));

        AssinaturaEntity assinatura = assinaturaRepository
                        .findByUsuarioId(usuarioId)
                        .orElseThrow(() -> new IllegalArgumentException("Este cliente ainda não possui assinatura"));

        assinatura.setStatus(AssinaturaStatus.ATIVO);
        assinaturaRepository.save(assinatura);
        return paraClienteResponse(usuario);
    }
    @Transactional
    public AdminClienteDTOResponse registrarPagamento(Long usuarioId, AdminPagamentoDTORequest request) {

        UsuarioEntity usuario =
                usuarioRepository
                        .findById(usuarioId)
                        .orElseThrow(() -> new IllegalArgumentException("Cliente não encontrado"));

        AssinaturaEntity assinatura =
                assinaturaRepository
                        .findByUsuarioId(usuarioId)
                        .orElseThrow(() -> new IllegalArgumentException("Este cliente ainda não possui assinatura"));

        if (assinatura.getValorMensal() == null) {
            throw new IllegalArgumentException("Configure o valor da assinatura antes de registrar o pagamento");
        }

        if (assinatura.getDiaVencimento() == null) {
            throw new IllegalArgumentException("Configure o vencimento antes de registrar o pagamento");
        }

        LocalDate vencimentoReferencia =
                assinatura.getProximoVencimento();

        PagamentoEntity pagamento =
                PagamentoEntity.builder()
                        .assinatura(assinatura)
                        .valor(request.getValorPago())
                        .vencimentoReferencia(vencimentoReferencia)
                        .pagoEm(LocalDateTime.now())
                        .build();

        pagamentoRepository.save(pagamento);

        assinatura.setStatus(AssinaturaStatus.ATIVO);

        assinatura.setProximoVencimento(calcularVencimentoSeguinte(
                assinatura));

        assinaturaRepository.save(assinatura);

        return paraClienteResponse(usuario);
    }
    private LocalDate calcularVencimentoSeguinte(AssinaturaEntity assinatura) {

        LocalDate vencimentoAtual = assinatura.getProximoVencimento();

        YearMonth mesBase;

        if (vencimentoAtual != null) {

            mesBase = YearMonth.from(vencimentoAtual).plusMonths(1);

        } else {

            mesBase = YearMonth
                            .from(LocalDate.now())
                            .plusMonths(1);}

        int dia = Math.min(
                        assinatura.getDiaVencimento(),
                        mesBase.lengthOfMonth());

        return mesBase.atDay(dia);
    }
}