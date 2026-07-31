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

import java.util.List;

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
        VendedorEntity vendedorEntity = vendedorConverter.paraVendedorEntity(vendedorDTORequest, usuarioEntity.getId());
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
    public List<VendedorDTOResponse> buscarVendedoresPorEmail(String token){
        String email = jwtUtil.extrairEmailToken(token.substring(7));
        List<VendedorEntity>listaVendedor = vendedorRepository.findByEmailUsuario(email);
        return vendedorConverter.paraListaVendedorDTOResponse(listaVendedor);

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