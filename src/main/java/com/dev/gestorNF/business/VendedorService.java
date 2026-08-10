package com.dev.gestorNF.business;

import com.dev.gestorNF.business.dto.in.VendedorDTORequest;
import com.dev.gestorNF.business.dto.out.VendedorDTOResponse;
import com.dev.gestorNF.business.mapper.VendedorConverter;
import com.dev.gestorNF.infrastructure.entity.out.UsuarioEntity;
import com.dev.gestorNF.infrastructure.entity.out.VendedorEntity;
import com.dev.gestorNF.infrastructure.repository.UsuarioRepository;
import com.dev.gestorNF.infrastructure.repository.VendedorRepository;
import com.dev.gestorNF.infrastructure.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VendedorService {

    private final VendedorConverter vendedorConverter;
    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;
    private final VendedorRepository vendedorRepository;
    private final VendedorEntity vendedorEntity;

    public VendedorDTOResponse cadastroVendedor(String token, VendedorDTORequest vendedorDTORequest) {
        String email = jwtUtil.extrairEmailToken(token.substring(7));
        UsuarioEntity usuarioEntity = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email não encontrado " + email));
        VendedorEntity vendedorEntity = vendedorConverter.paraVendedorEntity(vendedorDTORequest);
        return vendedorConverter.paraVendedorDTOResponse(vendedorRepository.save(vendedorEntity));
    }

    public boolean VendedorExiste(Long idVendedor) {
        return vendedorRepository.existsById(idVendedor);
    }

    public void deletaVendedor(Long idVendedor) {
        if (VendedorExiste(idVendedor)) {
            vendedorRepository.deleteById(idVendedor);
        } else {
            throw new RuntimeException("Id não encontrado " + idVendedor);
        }
    }
    public VendedorDTOResponse buscarVendedorPorId(String token,Long idVendedor){
        String email = jwtUtil.extrairEmailToken(token.substring(7));
        usuarioRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Email não encontrado " + email));

        VendedorEntity vendedor = vendedorRepository.findById(idVendedor)
                .orElseThrow(()->new RuntimeException("Vendedor não encontrado "+idVendedor));
        return vendedorConverter.paraVendedorDTOResponse(vendedor);

    }
    public VendedorDTOResponse updateComissao(String token, Long idVendedor,Double comissao){
        String email = jwtUtil.extrairEmailToken(token.substring(7));
         usuarioRepository.findByEmail(email)
                .orElseThrow(()->new RuntimeException("Email não encontrado "+email));
        VendedorEntity vendedorEntity = vendedorRepository.findById(idVendedor)
                .orElseThrow(()->new RuntimeException("Id não encontrado "+idVendedor));
         vendedorEntity.setComissao(comissao);
        return vendedorConverter.paraVendedorDTOResponse(vendedorRepository.save(vendedorEntity));
    }
}