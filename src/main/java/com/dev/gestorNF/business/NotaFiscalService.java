package com.dev.gestorNF.business;

import com.dev.gestorNF.business.dto.in.NotaFiscalDTORequest;
import com.dev.gestorNF.business.dto.out.ClienteDTOResponse;
import com.dev.gestorNF.business.dto.out.NotaFiscalDTOResponse;
import com.dev.gestorNF.business.dto.out.ResultadoGeralDTO;
import com.dev.gestorNF.business.dto.out.ResultadoGeralVendedorDTO;
import com.dev.gestorNF.business.mapper.NotaFiscalConverter;
import com.dev.gestorNF.infrastructure.entity.out.NotaFiscalEntity;
import com.dev.gestorNF.infrastructure.entity.out.UsuarioEntity;
import com.dev.gestorNF.infrastructure.entity.out.VendedorEntity;
import com.dev.gestorNF.infrastructure.exception.ConflictException;
import com.dev.gestorNF.infrastructure.repository.NotaFiscalRepository;
import com.dev.gestorNF.infrastructure.repository.UsuarioRepository;
import com.dev.gestorNF.infrastructure.repository.VendedorRepository;
import com.dev.gestorNF.infrastructure.security.JwtUtil;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotaFiscalService {

    private final NotaFiscalRepository notaFiscalRepository;
    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;
    private final VendedorRepository vendedorRepository;
    private final VendedorService vendedorService;
    private final NotaFiscalConverter notaFiscalConverter;
    private final ClienteService clienteService;

    public void verificaNotaFiscalExiste(int numeroNotaFiscal,Long usuarioId) {
        try {
            boolean existe = notaFiscalRepository.existsByNumeroNotaFiscalAndVendedorUsuarioId(numeroNotaFiscal,usuarioId);
            if (existe) {
                throw new ConflictException("Nota Fiscal já cadastrada");
            }

        } catch (ConflictException e) {
            throw new ConflictException("Nota Fiscal já cadastrada");
        }
    }
    private String resolverNomeEmpresa(String token, VendedorEntity vendedor,
            String codigoCliente, String nomeEmpresaDigitado, String cnpj, String municipio, String transportadora
    ) {
        if (codigoCliente == null || codigoCliente.isBlank()) {
            return nomeEmpresaDigitado;
        }

        ClienteDTOResponse cliente = clienteService.vincularClienteDaNota(token, vendedor, codigoCliente, nomeEmpresaDigitado,
                cnpj, municipio, transportadora);

        return cliente.getNomeEmpresa();
    }

    public NotaFiscalDTOResponse cadastrarNotaFiscal(String token, NotaFiscalDTORequest notaFiscalDTORequest) {

        String email = jwtUtil.extrairEmailToken(token.substring(7));
        UsuarioEntity usuarioEntity = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email não encontrado " + email));

        verificaNotaFiscalExiste(
                notaFiscalDTORequest.getNumeroNotaFiscal(), usuarioEntity.getId());

        VendedorEntity vendedorEntity = vendedorRepository.findByIdVendedorAndUsuarioId(notaFiscalDTORequest.getVendedorId(), usuarioEntity.getId())
                .orElseThrow(() -> new RuntimeException("Vendedor não encontrado"));

        String nomeEmpresaResolvido = resolverNomeEmpresa(
                token,
                vendedorEntity,
                notaFiscalDTORequest.getCodigoCliente(),
                notaFiscalDTORequest.getNomeEmpresa(),
                notaFiscalDTORequest.getCnpj(),
                notaFiscalDTORequest.getMunicipio(),
                notaFiscalDTORequest.getTransportadora()
        );
        NotaFiscalEntity notaFiscalEntity = notaFiscalConverter.paraNotaFiscalEntity(notaFiscalDTORequest, vendedorEntity, nomeEmpresaResolvido);

        return notaFiscalConverter.paraNotaFiscalDTOResponse(notaFiscalRepository.save(notaFiscalEntity));
    }
    public NotaFiscalDTOResponse editarNotaFiscal(String token, Long idNota, NotaFiscalDTORequest notaFiscalDTORequest) {

        String email = jwtUtil.extrairEmailToken(token.substring(7));

        UsuarioEntity usuarioEntity = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email não encontrado " + email));

        NotaFiscalEntity notaFiscalEntity = notaFiscalRepository.findByIdAndVendedorUsuarioId(idNota, usuarioEntity.getId())
                .orElseThrow(() -> new RuntimeException("Nota fiscal não encontrada"));

        boolean numeroJaUtilizado = notaFiscalRepository.existsByNumeroNotaFiscalAndVendedorUsuarioIdAndIdNot(
                                notaFiscalDTORequest.getNumeroNotaFiscal(),
                                usuarioEntity.getId(),
                                idNota
                        );

        if (numeroJaUtilizado) {
            throw new ConflictException("Já existe outra nota fiscal com esse número");
        }

        VendedorEntity vendedorEntity = vendedorRepository.findByIdVendedorAndUsuarioId(notaFiscalDTORequest.getVendedorId(),
                        usuarioEntity.getId())
                .orElseThrow(() -> new RuntimeException("Vendedor não encontrado"));

        String nomeEmpresaResolvido = resolverNomeEmpresa(
                token,
                vendedorEntity,
                notaFiscalDTORequest.getCodigoCliente(),
                notaFiscalDTORequest.getNomeEmpresa(),
                notaFiscalDTORequest.getCnpj(),
                notaFiscalDTORequest.getMunicipio(),
                notaFiscalDTORequest.getTransportadora()
        );

        notaFiscalEntity.setNumeroNotaFiscal(notaFiscalDTORequest.getNumeroNotaFiscal());

        notaFiscalEntity.setNomeEmpresa(nomeEmpresaResolvido);

        notaFiscalEntity.setCodigoCliente(notaFiscalDTORequest.getCodigoCliente());

        notaFiscalEntity.setValorNotaFiscal(notaFiscalDTORequest.getValorNotaFiscal());

        notaFiscalEntity.setDataVenda(notaFiscalDTORequest.getDataVenda());

        notaFiscalEntity.setVendedor(vendedorEntity);

        NotaFiscalEntity notaAtualizada = notaFiscalRepository.save(notaFiscalEntity);

        return notaFiscalConverter.paraNotaFiscalDTOResponse(notaAtualizada);
    }

    public void deletarNotaFiscal(String token, int numeroNotaFiscal) {

        String email = jwtUtil.extrairEmailToken(token.substring(7));

        UsuarioEntity usuarioEntity = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email não encontrado " + email));

        NotaFiscalEntity notaFiscalEntity = notaFiscalRepository
                        .findByNumeroNotaFiscalAndVendedorUsuarioId(numeroNotaFiscal, usuarioEntity.getId())
                        .orElseThrow(() -> new RuntimeException("Nota fiscal não encontrada"));

        notaFiscalRepository.delete(notaFiscalEntity);
    }

    public NotaFiscalDTOResponse buscarNotaFiscal(String token, int numeroNotaFiscal) {
        String email = jwtUtil.extrairEmailToken(token.substring(7));
        UsuarioEntity usuarioEntity = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email não encontrado " + email));

        NotaFiscalEntity notaFiscalEntity = notaFiscalRepository.findByNumeroNotaFiscalAndVendedorUsuarioId(numeroNotaFiscal, usuarioEntity.getId())
                        .orElseThrow(() -> new RuntimeException("Nota fiscal não encontrada"));

        return notaFiscalConverter.paraNotaFiscalDTOResponse(notaFiscalEntity);
    }

    public List<NotaFiscalDTOResponse> buscarNotasDoVendedor(String token, Long idVendedor) {

        String email = jwtUtil.extrairEmailToken(token.substring(7));
        UsuarioEntity usuarioEntity = usuarioRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Email não encontrado " + email));

        vendedorRepository.findByIdVendedorAndUsuarioId(idVendedor,usuarioEntity.getId())
                .orElseThrow(() ->
                        new RuntimeException("Vendedor não encontrado " + idVendedor));

        return notaFiscalRepository.findByVendedorIdVendedorOrderByDataVendaDesc(idVendedor)
                .stream()
                .map(notaFiscalConverter::paraNotaFiscalDTOResponse)
                .toList();
    }

    public Double valorTotalMensal(String token, Long idVendedor, YearMonth yearMonth) {

            String email = jwtUtil.extrairEmailToken(token.substring(7));
            UsuarioEntity usuarioEntity = usuarioRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Email não encontrado " + token));
            VendedorEntity vendedorEntity = vendedorRepository.findByIdVendedorAndUsuarioId(idVendedor,usuarioEntity.getId())
                    .orElseThrow(() -> new RuntimeException("Vendedor não encontrado"));
        return vendedorEntity.getNotasFiscais()
                    .stream()
                    .filter(nf -> YearMonth.from(nf.getDataVenda()).equals(yearMonth))
                    .mapToDouble(NotaFiscalEntity::getValorNotaFiscal)
                    .sum();
    }

    public Double valorTotalComissao(String token, Long idVendedor, YearMonth yearMonth) {

            String email = jwtUtil.extrairEmailToken(token.substring(7));
        UsuarioEntity usuarioEntity = usuarioRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Email não encontrado " + token));
            VendedorEntity vendedorEntity = vendedorRepository.findByIdVendedorAndUsuarioId(idVendedor,usuarioEntity.getId())
                    .orElseThrow(() -> new RuntimeException("Vendedor não encontrado"));
            Double total = valorTotalMensal(token, idVendedor, yearMonth) * (vendedorEntity.getComissao() / 100);

            return total;

        }
    public ResultadoGeralDTO buscarResultadoGeral(String token, YearMonth mes) {

        String email = jwtUtil.extrairEmailToken(token.substring(7));

        UsuarioEntity usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Usuário não encontrado")
                );

        if (usuario.getComissaoTotal() == null) {
            throw new RuntimeException(
                    "Configure primeiro a comissão total da empresa"
            );
        }

        LocalDate inicioMes = mes.atDay(1);
        LocalDate fimMes = mes.atEndOfMonth();

        List<NotaFiscalEntity> notas = notaFiscalRepository
                .findByVendedorUsuarioIdAndDataVendaBetweenOrderByDataVendaAsc(
                        usuario.getId(),
                        inicioMes,
                        fimMes
                );

        List<VendedorEntity> vendedores =
                vendedorRepository.findByUsuarioEmail(email);

        Map<Long, List<NotaFiscalEntity>> notasPorVendedor =
                notas.stream()
                        .collect(
                                Collectors.groupingBy(
                                        nota ->
                                                nota.getVendedor()
                                                        .getIdVendedor()
                                )
                        );

        List<ResultadoGeralVendedorDTO> resultadoVendedores =
                vendedores.stream()
                        .map(vendedor -> {

                            List<NotaFiscalEntity> notasVendedor =
                                    notasPorVendedor.getOrDefault(
                                            vendedor.getIdVendedor(),
                                            List.of()
                                    );

                            double totalVendas =
                                    notasVendedor.stream()
                                            .mapToDouble(
                                                    NotaFiscalEntity::getValorNotaFiscal
                                            )
                                            .sum();

                            double percentualVendedor =
                                    vendedor.getComissao();

                            double percentualUsuario =
                                    Math.max(
                                            0,
                                            usuario.getComissaoTotal()
                                                    - percentualVendedor
                                    );

                            double comissaoVendedor =
                                    totalVendas *
                                            (percentualVendedor / 100);

                            double comissaoUsuario =
                                    totalVendas *
                                            (percentualUsuario / 100);

                            return ResultadoGeralVendedorDTO.builder()
                                    .idVendedor(vendedor.getIdVendedor())
                                    .nomeVendedor(vendedor.getNome())
                                    .totalVendas(totalVendas)
                                    .percentualComissaoVendedor(
                                            percentualVendedor
                                    )
                                    .comissaoVendedor(
                                            comissaoVendedor
                                    )
                                    .percentualComissaoUsuario(
                                            percentualUsuario
                                    )
                                    .comissaoUsuario(
                                            comissaoUsuario
                                    )
                                    .build();
                        })
                        .toList();

        double vendasTotais =
                resultadoVendedores.stream()
                        .mapToDouble(
                                ResultadoGeralVendedorDTO::getTotalVendas
                        )
                        .sum();

        double comissoesVendedores =
                resultadoVendedores.stream()
                        .mapToDouble(
                                ResultadoGeralVendedorDTO::getComissaoVendedor
                        )
                        .sum();

        double comissaoUsuario =
                resultadoVendedores.stream()
                        .mapToDouble(
                                ResultadoGeralVendedorDTO::getComissaoUsuario
                        )
                        .sum();

        return ResultadoGeralDTO.builder()
                .mes(mes)
                .comissaoTotalEmpresa(
                        usuario.getComissaoTotal()
                )
                .vendasTotais(vendasTotais)
                .comissoesVendedores(
                        comissoesVendedores
                )
                .comissaoUsuario(
                        comissaoUsuario
                )
                .vendedores(
                        resultadoVendedores
                )
                .build();
    }
    public byte[] gerarPdfResultadoGeral(
            String token,
            YearMonth mes
    ) {

        ResultadoGeralDTO resultado =
                buscarResultadoGeral(token, mes);

        try {
            ByteArrayOutputStream outputStream =
                    new ByteArrayOutputStream();

            Document document = new Document();

            PdfWriter.getInstance(
                    document,
                    outputStream
            );

            document.open();

            Font tituloFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA_BOLD,
                            18
                    );

            Font subtituloFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA_BOLD,
                            12
                    );

            Font normalFont =
                    FontFactory.getFont(
                            FontFactory.HELVETICA,
                            10
                    );

            DateTimeFormatter formatadorMes =
                    DateTimeFormatter.ofPattern(
                            "MMMM 'de' yyyy",
                            new Locale("pt", "BR")
                    );

            String mesFormatado =
                    mes.atDay(1)
                            .format(formatadorMes);

            Paragraph titulo =
                    new Paragraph(
                            "GestorNF",
                            tituloFont
                    );

            titulo.setAlignment(
                    Element.ALIGN_CENTER
            );

            document.add(titulo);

            Paragraph periodo =
                    new Paragraph(
                            "Resultado geral - "
                                    + mesFormatado,
                            subtituloFont
                    );

            periodo.setAlignment(
                    Element.ALIGN_CENTER
            );

            periodo.setSpacingAfter(20);

            document.add(periodo);

            document.add(
                    new Paragraph(
                            "Comissão total da empresa: "
                                    + resultado.getComissaoTotalEmpresa()
                                    + "%",
                            normalFont
                    )
            );

            document.add(
                    new Paragraph(
                            "Vendas totais: "
                                    + formatarMoeda(
                                    resultado.getVendasTotais()
                            ),
                            subtituloFont
                    )
            );

            document.add(
                    new Paragraph(
                            "Comissões dos vendedores: "
                                    + formatarMoeda(
                                    resultado.getComissoesVendedores()
                            ),
                            subtituloFont
                    )
            );

            document.add(
                    new Paragraph(
                            "Sua comissão: "
                                    + formatarMoeda(
                                    resultado.getComissaoUsuario()
                            ),
                            subtituloFont
                    )
            );

            Paragraph espaco =
                    new Paragraph(" ");

            espaco.setSpacingAfter(10);

            document.add(espaco);

            PdfPTable tabela =
                    new PdfPTable(4);

            tabela.setWidthPercentage(100);

            tabela.setWidths(
                    new float[]{
                            2.2f,
                            1.8f,
                            2.2f,
                            2.2f
                    }
            );

            adicionarCabecalho(
                    tabela,
                    "Vendedor",
                    "Vendas",
                    "Comissão dele",
                    "Sua comissão"
            );

            for (
                    ResultadoGeralVendedorDTO vendedor :
                    resultado.getVendedores()
            ) {

                tabela.addCell(
                        new PdfPCell(
                                new Phrase(
                                        vendedor.getNomeVendedor(),
                                        normalFont
                                )
                        )
                );

                tabela.addCell(
                        new PdfPCell(
                                new Phrase(
                                        formatarMoeda(
                                                vendedor.getTotalVendas()
                                        ),
                                        normalFont
                                )
                        )
                );

                tabela.addCell(
                        new PdfPCell(
                                new Phrase(
                                        formatarMoeda(
                                                vendedor.getComissaoVendedor()
                                        )
                                                + " ("
                                                + vendedor.getPercentualComissaoVendedor()
                                                + "%)",
                                        normalFont
                                )
                        )
                );

                tabela.addCell(
                        new PdfPCell(
                                new Phrase(
                                        formatarMoeda(
                                                vendedor.getComissaoUsuario()
                                        )
                                                + " ("
                                                + vendedor.getPercentualComissaoUsuario()
                                                + "%)",
                                        normalFont
                                )
                        )
                );
            }

            document.add(tabela);

            document.close();

            return outputStream.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException(
                    "Erro ao gerar PDF do resultado geral",
                    e
            );
        }
    }

    public byte[] gerarRelatorioMensal(String token, YearMonth mes, Long idVendedor) {

        String email = jwtUtil.extrairEmailToken(token.substring(7));
        UsuarioEntity usuario = usuarioRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Usuário não encontrado"));

        LocalDate inicioMes = mes.atDay(1);
        LocalDate fimMes = mes.atEndOfMonth();

        List<NotaFiscalEntity> notas;

        if (idVendedor != null) {

            VendedorEntity vendedor = vendedorRepository
                    .findByIdVendedorAndUsuarioId(idVendedor, usuario.getId()
                    )
                    .orElseThrow(() -> new RuntimeException("Vendedor não encontrado"));

            notas = notaFiscalRepository
                    .findByVendedorIdVendedorAndDataVendaBetweenOrderByDataVendaAsc(vendedor.getIdVendedor(), inicioMes, fimMes);

        } else {

            notas = notaFiscalRepository
                    .findByVendedorUsuarioIdAndDataVendaBetweenOrderByDataVendaAsc(usuario.getId(), inicioMes, fimMes);
        }

        return criarPdfRelatorio(notas, mes, idVendedor);
    }
    private byte[] criarPdfRelatorio(List<NotaFiscalEntity> notas, YearMonth mes, Long idVendedor) {

        try {

            ByteArrayOutputStream outputStream =
                    new ByteArrayOutputStream();

            Document document = new Document();

            PdfWriter.getInstance(document, outputStream);

            document.open();

            Font tituloFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);

            Font subtituloFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);

            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

            DateTimeFormatter formatadorMes = DateTimeFormatter.ofPattern("MMMM 'de' yyyy", new Locale("pt", "BR"));

            String mesFormatado = mes.atDay(1).format(formatadorMes);

            Paragraph titulo = new Paragraph("GestorNF", tituloFont);

            titulo.setAlignment(Element.ALIGN_CENTER);

            document.add(titulo);

            Paragraph periodo =
                    new Paragraph("Relatório mensal - " + mesFormatado, subtituloFont);

            periodo.setAlignment(Element.ALIGN_CENTER);

            periodo.setSpacingAfter(20);

            document.add(periodo);

            if (idVendedor == null) {

                gerarRelatorioTodosVendedores(document, notas, normalFont, subtituloFont);

            } else {
                gerarRelatorioVendedor(document, notas, normalFont, subtituloFont);
            }

            document.close();

            return outputStream.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar relatório PDF", e);
        }
    }
    private void gerarRelatorioVendedor(Document document, List<NotaFiscalEntity> notas, Font normalFont, Font subtituloFont
    ) throws Exception {

        if (notas.isEmpty()) {
            document.add(
                    new Paragraph("Nenhuma nota fiscal encontrada para este mês.", normalFont));
            return;
        }

        VendedorEntity vendedor = notas.get(0).getVendedor();

        Paragraph vendedorTitulo =
                new Paragraph("Vendedor: " + vendedor.getNome(), subtituloFont);

        vendedorTitulo.setSpacingAfter(10);
        document.add(vendedorTitulo);
        adicionarTabelaNotas(document, notas, normalFont);

        double totalVendas = notas.stream().mapToDouble(NotaFiscalEntity::getValorNotaFiscal).sum();

        double totalComissao = totalVendas * (vendedor.getComissao() / 100);

        document.add(new Paragraph("Total vendido: " + formatarMoeda(totalVendas), subtituloFont));

        document.add(new Paragraph("Comissão (" + vendedor.getComissao()
                                + "%): " + formatarMoeda(totalComissao),
                        subtituloFont));
    }
    private void gerarRelatorioTodosVendedores(Document document, List<NotaFiscalEntity> notas, Font normalFont, Font subtituloFont
    ) throws Exception {

        if (notas.isEmpty()) {

            document.add(new Paragraph("Nenhuma nota fiscal encontrada para este mês.", normalFont));

            return;
        }

        var notasPorVendedor = notas.stream().collect(
                                java.util.stream.Collectors.groupingBy(NotaFiscalEntity::getVendedor));

        double totalGeral = 0;
        double totalComissoes = 0;

        for (var entrada : notasPorVendedor.entrySet()) {

            VendedorEntity vendedor = entrada.getKey();

            List<NotaFiscalEntity> notasVendedor = entrada.getValue();

            Paragraph tituloVendedor = new Paragraph("Vendedor: " + vendedor.getNome(), subtituloFont);

            tituloVendedor.setSpacingBefore(15);
            tituloVendedor.setSpacingAfter(8);

            document.add(tituloVendedor);
            adicionarTabelaNotas(document, notasVendedor, normalFont
            );

            double totalVendas = notasVendedor.stream().mapToDouble(NotaFiscalEntity::getValorNotaFiscal).sum();

            double comissao = totalVendas * (vendedor.getComissao() / 100);

            totalGeral += totalVendas;
            totalComissoes += comissao;
            document.add(new Paragraph("Total vendido: " + formatarMoeda(totalVendas), subtituloFont));

            document.add(
                    new Paragraph("Comissão (" + vendedor.getComissao() + "%): " + formatarMoeda(comissao), subtituloFont));
        }

        Paragraph totalFinal =
                new Paragraph("\nTOTAL GERAL DO MÊS: " + formatarMoeda(totalGeral), subtituloFont);

        totalFinal.setSpacingBefore(20);

        document.add(totalFinal);

        document.add(
                new Paragraph("TOTAL DE COMISSÕES: " + formatarMoeda(totalComissoes), subtituloFont));
    }
    private void adicionarTabelaNotas(Document document, List<NotaFiscalEntity> notas, Font font) throws Exception {

        PdfPTable tabela = new PdfPTable(5);

        tabela.setWidthPercentage(100);

        tabela.setWidths(new float[]{1.2f, 1.5f, 3f, 1.5f, 1.7f});

        adicionarCabecalho(tabela, "NF", "Cód. Cliente", "Cliente / Empresa", "Data", "Valor");

        DateTimeFormatter dataFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        for (NotaFiscalEntity nota : notas) {

            tabela.addCell(new PdfPCell(new Phrase(String.valueOf(nota.getNumeroNotaFiscal()), font)));

            tabela.addCell(new PdfPCell(new Phrase(nota.getCodigoCliente() != null ? nota.getCodigoCliente() : "-", font)));

            tabela.addCell(new PdfPCell(new Phrase(nota.getNomeEmpresa(), font)));

            tabela.addCell(
                    new PdfPCell(new Phrase(nota.getDataVenda().format(dataFormatter), font)));

            tabela.addCell(
                    new PdfPCell(new Phrase(formatarMoeda(nota.getValorNotaFiscal()), font)));
        }

        tabela.setSpacingAfter(10);
        document.add(tabela);
    }
    private void adicionarCabecalho(PdfPTable tabela, String... titulos
    ) {

        Font fonte = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);

        for (String titulo : titulos) {

            PdfPCell cell =
                    new PdfPCell(new Phrase(titulo, fonte));

            cell.setHorizontalAlignment(Element.ALIGN_CENTER);

            cell.setPadding(6);
            tabela.addCell(cell);
        }
    }
    private String formatarMoeda(double valor) {

        NumberFormat formato =
                NumberFormat.getCurrencyInstance(new Locale("pt", "BR"));

        return formato.format(valor);
    }
    }




