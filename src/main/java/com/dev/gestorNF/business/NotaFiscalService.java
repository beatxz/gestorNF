package com.dev.gestorNF.business;

import com.dev.gestorNF.business.dto.in.NotaFiscalDTORequest;
import com.dev.gestorNF.business.dto.out.NotaFiscalDTOResponse;
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

@Service
@RequiredArgsConstructor
public class NotaFiscalService {

    private final NotaFiscalRepository notaFiscalRepository;
    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;
    private final VendedorRepository vendedorRepository;
    private final VendedorService vendedorService;
    private final NotaFiscalConverter notaFiscalConverter;

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

    public NotaFiscalDTOResponse cadastrarNotaFiscal(String token, NotaFiscalDTORequest notaFiscalDTORequest) {

        String email = jwtUtil.extrairEmailToken(token.substring(7));
        UsuarioEntity usuarioEntity = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email não encontrado " + email));

        verificaNotaFiscalExiste(
                notaFiscalDTORequest.getNumeroNotaFiscal(), usuarioEntity.getId());

        VendedorEntity vendedorEntity = vendedorRepository.findByIdVendedorAndUsuarioId(notaFiscalDTORequest.getVendedorId(), usuarioEntity.getId())
                .orElseThrow(() -> new RuntimeException("Vendedor não encontrado"));

        NotaFiscalEntity notaFiscalEntity = notaFiscalConverter.paraNotaFiscalEntity(notaFiscalDTORequest, vendedorEntity);

        return notaFiscalConverter.paraNotaFiscalDTOResponse(notaFiscalRepository.save(notaFiscalEntity));
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

        return notaFiscalRepository.findByVendedorIdVendedor(idVendedor)
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

        PdfPTable tabela = new PdfPTable(4);

        tabela.setWidthPercentage(100);

        tabela.setWidths(new float[]{1.3f, 3f, 1.5f, 1.7f});

        adicionarCabecalho(tabela, "NF", "Cliente / Empresa", "Data", "Valor");

        DateTimeFormatter dataFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        for (NotaFiscalEntity nota : notas) {

            tabela.addCell(new PdfPCell(new Phrase(String.valueOf(nota.getNumeroNotaFiscal()), font)));

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




