package com.dev.gestorNF.business;

import com.dev.gestorNF.business.dto.out.NotaFiscalImportacaoDTOResponse;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class NotaFiscalImportacaoService {

    public String extrairTexto(MultipartFile arquivo) {

        if (arquivo == null || arquivo.isEmpty()) {
            throw new RuntimeException("Selecione um arquivo PDF");
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

        return NotaFiscalImportacaoDTOResponse.builder()
                .numeroNotaFiscal(extrairNumeroNota(texto))
                .codigoCliente(extrairCodigoCliente(texto))
                .nomeEmpresa(extrairNomeEmpresa(texto))
                .valorNotaFiscal(extrairValorTotal(texto))
                .dataEmissao(extrairDataEmissao(texto))
                .cnpj(extrairCnpjCliente(texto))
                .municipio(extrairMunicipio(texto))
                .transportadora(extrairTransportadora(texto))
                .build();
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
                "(?m)^(\\d+)\\s+-\\s+.+?\\s+\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}\\s+\\d{2}/\\d{2}/\\d{4}\\s*$"
        ).matcher(texto);

        if (matcher.find()) {
            return matcher.group(1);
        }

        return null;
    }

    private String extrairNomeEmpresa(String texto) {
        Matcher matcher = Pattern.compile(
                "(?m)^\\d+\\s+-\\s+(.+?)\\s+\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}\\s+\\d{2}/\\d{2}/\\d{4}\\s*$"
        ).matcher(texto);

        if (matcher.find()) {
            return matcher.group(1).trim();
        }

        return null;
    }

    private String extrairCnpjCliente(String texto) {
        Matcher matcher = Pattern.compile(
                "(?m)^\\d+\\s+-\\s+.+?\\s+(\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2})\\s+\\d{2}/\\d{2}/\\d{4}\\s*$"
        ).matcher(texto);

        if (matcher.find()) {
            return matcher.group(1);
        }

        return null;
    }

    private LocalDate extrairDataEmissao(String texto) {
        Matcher matcher = Pattern.compile(
                "(?m)^\\d+\\s+-\\s+.+?\\s+\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}\\s+(\\d{2}/\\d{2}/\\d{4})\\s*$"
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