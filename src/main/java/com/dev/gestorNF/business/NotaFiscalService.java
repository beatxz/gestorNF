package com.dev.gestorNF.business;

import com.dev.gestorNF.business.dto.in.NotaFiscalDTORequest;
import com.dev.gestorNF.business.dto.out.NotaFiscalDTOResponse;
import com.dev.gestorNF.business.mapper.NotaFiscalConverter;
import com.dev.gestorNF.infrastructure.entity.out.NotaFiscalEntity;
import com.dev.gestorNF.infrastructure.exception.ConflictException;
import com.dev.gestorNF.infrastructure.repository.NotaFiscalRepository;
import com.dev.gestorNF.infrastructure.repository.UsuarioRepository;
import com.dev.gestorNF.infrastructure.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotaFiscalService {

    private final NotaFiscalRepository notaFiscalRepository;
    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;
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
        NotaFiscalEntity notaFiscalEntity = notaFiscalConverter.paraNotaFiscalEntity(notaFiscalDTORequest);
        return notaFiscalConverter.paraNotaFiscalDTOResponse(notaFiscalRepository.save(notaFiscalEntity));
    }

    public void deletarNotaFiscal(int numeroNotaFiscal) {
        notaFiscalRepository.deleteByNumeroNotaFiscal(numeroNotaFiscal);
    }

    public NotaFiscalDTOResponse buscarNotaFiscal(String token , int numeroNotaFiscal){
        String email = jwtUtil.extrairEmailToken(token.substring(7));
        usuarioRepository.findByEmail(email).orElseThrow(()->new RuntimeException("Email não encontrado "+email));
        verificaNotaFiscalExiste(numeroNotaFiscal);
        NotaFiscalEntity notaFiscalEntity = notaFiscalRepository.findByNumeroNotaFiscal(numeroNotaFiscal)
                .orElseThrow(()->new RuntimeException("Nota fiscal não encontrada"));
        return notaFiscalConverter.paraNotaFiscalDTOResponse(notaFiscalEntity);
    }

}


