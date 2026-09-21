package com.dev.gestorNF.business;

import com.dev.gestorNF.business.dto.out.NotaFiscalImportacaoDTOResponse;
import com.dev.gestorNF.business.dto.out.NotaFiscalImportacaoLoteDTOResponse;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class NotaFiscalImportacaoService {

    private static final long TAMANHO_MAXIMO_PDF = 10 * 1024 * 1024;
    private static final String REGEX_DOCUMENTO =
            "(?:\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}|\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2})";

    public String extrairTexto(MultipartFile arquivo) {

        if (arquivo == null || arquivo.isEmpty()) {
            throw new RuntimeException("Selecione um arquivo PDF");
        }

        if (arquivo.getSize() > TAMANHO_MAXIMO_PDF) {
            throw new RuntimeException("O arquivo PDF deve ter no máximo 10 MB");
        }

        if (!"application/pdf".equalsIgnoreCase(arquivo.getContentType())) {
            throw new RuntimeException("O arquivo deve ser um PDF");
        }

        try (PDDocument documento = Loader.loadPDF(arquivo.getBytes())) {

            PDFTextStripper stripper = new PDFTextStripper();

            return stripper.getText(documento);

        } catch (IOException e) {
            throw new RuntimeException("Não foi possível ler o arquivo PDF", e);
        }
    }
    public NotaFiscalImportacaoDTOResponse importar(MultipartFile arquivo) {
        String texto = extrairTexto(arquivo);

        Integer numeroNota = extrairNumeroNota(texto);
        String codigoCliente = extrairCodigoCliente(texto);
        String nomeEmpresa = extrairNomeEmpresa(texto);
        Double valorTotal = extrairValorTotal(texto);
        LocalDate dataEmissao = extrairDataEmissao(texto);

        if (numeroNota == null ||
                nomeEmpresa == null || nomeEmpresa.isBlank() ||
                valorTotal == null ||
                dataEmissao == null) {

            throw new RuntimeException(
                    "O arquivo não parece ser uma nota fiscal válida"
            );
        }

        return NotaFiscalImportacaoDTOResponse.builder()
                .numeroNotaFiscal(numeroNota)
                .codigoCliente(codigoCliente)
                .nomeEmpresa(nomeEmpresa)
                .valorNotaFiscal(valorTotal)
                .dataEmissao(dataEmissao)
                .cnpj(extrairDocumentoCliente(texto))
                .municipio(extrairMunicipio(texto))
                .transportadora(extrairTransportadora(texto))
                .build();
    }
    public List<NotaFiscalImportacaoLoteDTOResponse> importarLote(
            List<MultipartFile> arquivos) {

        if (arquivos == null || arquivos.isEmpty()) {
            throw new RuntimeException("Selecione pelo menos um arquivo PDF");
        }

        if (arquivos.size() > 50) {
            throw new RuntimeException("É permitido importar no máximo 50 notas por vez");
        }

        List<NotaFiscalImportacaoLoteDTOResponse> resultado = new ArrayList<>();

        for (MultipartFile arquivo : arquivos) {

            try {
                NotaFiscalImportacaoDTOResponse nota = importar(arquivo);

                resultado.add(
                        NotaFiscalImportacaoLoteDTOResponse.builder()
                                .nomeArquivo(arquivo.getOriginalFilename())
                                .nota(nota)
                                .valida(true)
                                .erro(null)
                                .build()
                );

            } catch (Exception e) {

                resultado.add(
                        NotaFiscalImportacaoLoteDTOResponse.builder()
                                .nomeArquivo(arquivo.getOriginalFilename())
                                .nota(null)
                                .valida(false)
                                .erro(e.getMessage())
                                .build());
            }
        }

        return resultado;
    }
    private Integer extrairNumeroNota(String texto) {
        Matcher matcher = Pattern.compile("N[°º]\\s*(\\d+)\\s+FL").matcher(texto);

        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }

        return null;
    }

    private String extrairCodigoCliente(String texto) {
        Matcher matcher = Pattern.compile(
                "(?m)^(\\d+)\\s+-\\s+.+?\\s+" +
                        REGEX_DOCUMENTO +
                        "\\s+\\d{2}/\\d{2}/\\d{4}\\s*$"
        ).matcher(texto);

        if (matcher.find()) {
            return matcher.group(1);
        }

        return null;
    }

    private String extrairNomeEmpresa(String texto) {
        Matcher matcher = Pattern.compile(
                "(?m)^\\d+\\s+-\\s+(.+?)\\s+" +
                        REGEX_DOCUMENTO +
                        "\\s+\\d{2}/\\d{2}/\\d{4}\\s*$"
        ).matcher(texto);

        if (matcher.find()) {
            return matcher.group(1).trim();
        }

        return null;
    }

    private String extrairDocumentoCliente(String texto) {
        Matcher matcher = Pattern.compile(
                "(?m)^\\d+\\s+-\\s+.+?\\s+(" +
                        REGEX_DOCUMENTO +
                        ")\\s+\\d{2}/\\d{2}/\\d{4}\\s*$"
        ).matcher(texto);

        if (matcher.find()) {
            return matcher.group(1);
        }

        return null;
    }

    private LocalDate extrairDataEmissao(String texto) {
        Matcher matcher = Pattern.compile(
                "(?m)^\\d+\\s+-\\s+.+?\\s+" +
                        REGEX_DOCUMENTO +
                        "\\s+(\\d{2}/\\d{2}/\\d{4})\\s*$"
        ).matcher(texto);

        if (matcher.find()) {
            return LocalDate.parse(
                    matcher.group(1),
                    DateTimeFormatter.ofPattern("dd/MM/yyyy")
            );
        }

        return null;
    }
    private String extrairMunicipio(String texto) {
        Matcher matcher = Pattern.compile(
                "(?m)^(.+?)\\s+\\d{2}\\s+\\d{8,11}\\s+[A-Z]{2}\\s+\\d+\\s*$"
        ).matcher(texto);

        if (matcher.find()) {
            return matcher.group(1).trim();
        }

        return null;
    }
    private String extrairTransportadora(String texto) {
        Matcher matcher = Pattern.compile(
                "TRANSPORTADOR/VOLUMES TRANSPORTADOS.*?Peso Líquido\\R(.+?)\\R",
                Pattern.DOTALL
        ).matcher(texto);

        if (matcher.find()) {
            return matcher.group(1).trim();
        }

        return null;
    }
    private Double extrairValorTotal(String texto) {
        Matcher matcher = Pattern.compile(
                "Valor do Frete.*?Valor Total da Nota.*?\\R([\\d.,]+)",
                Pattern.DOTALL
        ).matcher(texto);

        if (matcher.find()) {
            String valor = matcher.group(1)
                    .replace(".", "")
                    .replace(",", ".");

            return Double.parseDouble(valor);
        }

        return null;
    }
}