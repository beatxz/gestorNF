package com.dev.gestorNF.business;

import com.dev.gestorNF.business.dto.in.VendedorDTORequest;
import com.dev.gestorNF.business.dto.out.VendedorDTOResponse;
import com.dev.gestorNF.business.mapper.VendedorConverter;
import com.dev.gestorNF.infrastructure.entity.out.ClienteEntity;
import com.dev.gestorNF.infrastructure.entity.out.UsuarioEntity;
import com.dev.gestorNF.infrastructure.entity.out.VendedorEntity;
import com.dev.gestorNF.infrastructure.repository.ClienteRepository;
import com.dev.gestorNF.infrastructure.repository.NotaFiscalRepository;
import com.dev.gestorNF.infrastructure.repository.UsuarioRepository;
import com.dev.gestorNF.infrastructure.repository.VendedorRepository;
import com.dev.gestorNF.infrastructure.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VendedorService {

    private final VendedorConverter vendedorConverter;
    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;
    private final VendedorRepository vendedorRepository;
    private final NotaFiscalRepository notaFiscalRepository;
    private final ClienteRepository clienteRepository;

    public VendedorDTOResponse cadastroVendedor(String token, VendedorDTORequest vendedorDTORequest) {

        String email = jwtUtil.extrairEmailToken(token.substring(7));
        UsuarioEntity usuarioEntity = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email não encontrado " + email));

        validarComissao(usuarioEntity, vendedorDTORequest.getComissao());

        VendedorEntity vendedorEntity =
                vendedorConverter.paraVendedorEntity(vendedorDTORequest);

        vendedorEntity.setUsuario(usuarioEntity);

        VendedorEntity vendedorSalvo =
                vendedorRepository.save(vendedorEntity);

        return vendedorConverter.paraVendedorDTOResponse(vendedorSalvo);
    }

    @Transactional
    public void deletaVendedor(String token, Long idVendedor) {

        String email = jwtUtil.extrairEmailToken(token.substring(7));

        UsuarioEntity usuarioEntity = usuarioRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Email não encontrado " + email));

        VendedorEntity vendedorEntity =
                vendedorRepository.findByIdVendedorAndUsuarioId(
                        idVendedor,
                        usuarioEntity.getId()
                ).orElseThrow(() ->
                        new RuntimeException("Vendedor não encontrado"));

        boolean possuiNotas =
                !notaFiscalRepository
                        .findByVendedorIdVendedor(idVendedor)
                        .isEmpty();

        if (possuiNotas) {
            throw new RuntimeException(
                    "Não é possível excluir este vendedor porque existem notas fiscais vinculadas a ele."
            );
        }

        List<ClienteEntity> clientes =
                clienteRepository.findByVendedorIdVendedor(idVendedor);

        clientes.forEach(cliente -> cliente.setVendedor(null));

        clienteRepository.saveAll(clientes);

        vendedorRepository.delete(vendedorEntity);
    }

    public List<VendedorDTOResponse> buscarVendedoresDoUsuario(String token) {
        String email = jwtUtil.extrairEmailToken(token.substring(7));
        UsuarioEntity usuarioEntity = usuarioRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Email não encontrado " + email));

        return vendedorRepository.findByUsuarioEmail(email)
                .stream()
                .map(vendedorConverter::paraVendedorDTOResponse)
                .toList();
    }
    public VendedorDTOResponse buscarVendedorPorId(String token,Long idVendedor){
        String email = jwtUtil.extrairEmailToken(token.substring(7));
        UsuarioEntity usuarioEntity = usuarioRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("Email não encontrado " + email));

        VendedorEntity vendedor = vendedorRepository.findByIdVendedorAndUsuarioId(idVendedor,usuarioEntity.getId())
                .orElseThrow(()->new RuntimeException("Vendedor não encontrado "+idVendedor));
        return vendedorConverter.paraVendedorDTOResponse(vendedor);

    }
    public VendedorDTOResponse updateComissao(String token, Long idVendedor,Double comissao){
        String email = jwtUtil.extrairEmailToken(token.substring(7));
        UsuarioEntity usuarioEntity = usuarioRepository.findByEmail(email)
                .orElseThrow(()->new RuntimeException("Email não encontrado "+email));
        validarComissao(usuarioEntity, comissao);
        VendedorEntity vendedorEntity = vendedorRepository.findByIdVendedorAndUsuarioId(idVendedor,usuarioEntity.getId())
                .orElseThrow(()->new RuntimeException("Id não encontrado "+idVendedor));
         vendedorEntity.setComissao(comissao);
        return vendedorConverter.paraVendedorDTOResponse(vendedorRepository.save(vendedorEntity));
    }
    private void validarComissao(UsuarioEntity usuario, Double comissaoVendedor) {

        if (comissaoVendedor == null || comissaoVendedor < 0) {
            throw new RuntimeException("Informe uma comissão válida");
        }

        if (usuario.getComissaoTotal() == null) {
            throw new RuntimeException("Configure primeiro a comissão total da empresa");
        }

        if (comissaoVendedor > usuario.getComissaoTotal()) {
            throw new RuntimeException("A comissão do vendedor não pode ser maior que a comissão total da empresa");
        }
    }
}