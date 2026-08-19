package com.dev.gestorNF.business;

import com.dev.gestorNF.business.dto.in.NotaFiscalDTORequest;
import com.dev.gestorNF.business.dto.out.NotaFiscalDTOResponse;
import com.dev.gestorNF.business.mapper.NotaFiscalConverter;
import com.dev.gestorNF.infrastructure.entity.out.NotaFiscalEntity;
import com.dev.gestorNF.infrastructure.entity.out.VendedorEntity;
import com.dev.gestorNF.infrastructure.exception.ConflictException;
import com.dev.gestorNF.infrastructure.repository.NotaFiscalRepository;
import com.dev.gestorNF.infrastructure.repository.UsuarioRepository;
import com.dev.gestorNF.infrastructure.repository.VendedorRepository;
import com.dev.gestorNF.infrastructure.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotaFiscalService {

    private final NotaFiscalRepository notaFiscalRepository;
    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;
    private final VendedorRepository vendedorRepository;
    private final VendedorService vendedorService;
    private final NotaFiscalConverter notaFiscalConverter;

    public void verificaNotaFiscalExiste(int numeroNotaFiscal) {
        try {
            boolean existe = notaFiscalRepository.existsByNumeroNotaFiscal(numeroNotaFiscal);
            if (existe) {
                throw new ConflictException("Nota Fiscal já cadastrada");
            }

        } catch (ConflictException e) {
            throw new ConflictException("Nota Fiscal já cadastrada");
        }
    }

    public NotaFiscalDTOResponse cadastrarNotaFiscal(String token, NotaFiscalDTORequest notaFiscalDTORequest) {

        String email = jwtUtil.extrairEmailToken(token.substring(7));
        usuarioRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Email não encontrado " + email));
        verificaNotaFiscalExiste(notaFiscalDTORequest.getNumeroNotaFiscal());
        VendedorEntity vendedorEntity = vendedorRepository.findById(
                notaFiscalDTORequest.getVendedorId()
        ).orElseThrow(() -> new RuntimeException("Vendedor não encontrado"));
        NotaFiscalEntity notaFiscalEntity = notaFiscalConverter.paraNotaFiscalEntity(notaFiscalDTORequest, vendedorEntity);
        return notaFiscalConverter.paraNotaFiscalDTOResponse(notaFiscalRepository.save(notaFiscalEntity));
    }

    public void deletarNotaFiscal(int numeroNotaFiscal) {
        notaFiscalRepository.deleteByNumeroNotaFiscal(numeroNotaFiscal);
    }

    public NotaFiscalDTOResponse buscarNotaFiscal(String token, int numeroNotaFiscal) {
        String email = jwtUtil.extrairEmailToken(token.substring(7));
        usuarioRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Email não encontrado " + email));

        NotaFiscalEntity notaFiscalEntity =
                notaFiscalRepository.findByNumeroNotaFiscal(numeroNotaFiscal)
                        .orElseThrow(() ->
                                new RuntimeException("Nota fiscal não encontrada"));

        return notaFiscalConverter
                .paraNotaFiscalDTOResponse(notaFiscalEntity);
    }

    public List<NotaFiscalDTOResponse> buscarNotasDoVendedor(String token, Long idVendedor) {

        String email = jwtUtil.extrairEmailToken(token.substring(7));
        usuarioRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Email não encontrado " + email));

        vendedorRepository.findById(idVendedor)
                .orElseThrow(() ->
                        new RuntimeException("Vendedor não encontrado " + idVendedor));

        return notaFiscalRepository.findByVendedorIdVendedor(idVendedor)
                .stream()
                .map(notaFiscalConverter::paraNotaFiscalDTOResponse)
                .toList();
    }

    public Double valorTotalMensal(String token, Long idVendedor, YearMonth yearMonth) {
        try {
            String email = jwtUtil.extrairEmailToken(token.substring(7));
            usuarioRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Email não encontrado " + token));
            VendedorEntity vendedorEntity = vendedorRepository.findById(idVendedor)
                    .orElseThrow(() -> new RuntimeException("Vendedor não encontrado"));
            Double total = vendedorEntity.getNotasFiscais()
                    .stream()
                    .filter(nf -> YearMonth.from(nf.getDataVenda()).equals(yearMonth))
                    .mapToDouble(NotaFiscalEntity::getValorNotaFiscal)
                    .sum();
            return total;
        } catch (RuntimeException e) {
            throw new RuntimeException("Notas não encontradas");
        }
    }

    public Double valorTotalComissao(String token, Long idVendedor, YearMonth yearMonth) {
        try {

            String email = jwtUtil.extrairEmailToken(token.substring(7));
            usuarioRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Email não encontrado " + token));
            VendedorEntity vendedorEntity = vendedorRepository.findById(idVendedor)
                    .orElseThrow(() -> new RuntimeException("Vendedor não encontrado"));
            Double total = valorTotalMensal(token, idVendedor, yearMonth) * (vendedorEntity.getComissao() / 100);

            return total;

        } catch (RuntimeException e) {
            throw new RuntimeException("Notas não encontradas");
        }
    }
}


