package com.dev.gestorNF.business;

import com.dev.gestorNF.business.dto.in.VendedorDTORequest;
import com.dev.gestorNF.business.dto.out.VendedorDTOResponse;
import com.dev.gestorNF.business.mapper.VendedorConverter;
import com.dev.gestorNF.infrastructure.entity.out.ClienteEntity;
import com.dev.gestorNF.infrastructure.entity.out.UsuarioEntity;
import com.dev.gestorNF.infrastructure.entity.out.VendedorEntity;
import com.dev.gestorNF.infrastructure.repository.*;
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
    private final MetaVendedorRepository metaVendedorRepository;

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
    public void desativarVendedor(
            String token,
            Long idVendedor,
            Long transferirParaId
    ) {
        String email = jwtUtil.extrairEmailToken(token.substring(7));

        UsuarioEntity usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        VendedorEntity vendedor = vendedorRepository
                .findByIdVendedorAndUsuarioId(idVendedor, usuario.getId())
                .orElseThrow(() -> new RuntimeException("Vendedor não encontrado"));

        if (!vendedor.isAtivo()) {
            throw new IllegalArgumentException("Este vendedor já está desativado");
        }

        VendedorEntity destino = null;

        if (transferirParaId != null) {
            if (idVendedor.equals(transferirParaId)) {
                throw new IllegalArgumentException(
                        "O vendedor de destino deve ser diferente do vendedor desativado"
                );
            }

            destino = vendedorRepository
                    .findByIdVendedorAndUsuarioId(transferirParaId, usuario.getId())
                    .orElseThrow(() -> new RuntimeException("Vendedor de destino não encontrado"));

            if (!destino.isAtivo()) {
                throw new IllegalArgumentException(
                        "Não é possível transferir clientes para um vendedor inativo"
                );
            }
        }

        List<ClienteEntity> clientes =
                clienteRepository.findByVendedorIdVendedor(idVendedor);

        for (ClienteEntity cliente : clientes) {
            if (destino == null) {
                cliente.setAtivo(false);
            } else {
                cliente.setVendedor(destino);
                cliente.setAtivo(true);
            }
        }

        clienteRepository.saveAll(clientes);

        vendedor.setAtivo(false);
        vendedorRepository.save(vendedor);
    }

    public List<VendedorDTOResponse> buscarVendedoresDoUsuario(String token) {
        String email = jwtUtil.extrairEmailToken(token.substring(7));
        UsuarioEntity usuarioEntity = usuarioRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("Email não encontrado " + email));

        return vendedorRepository.findByUsuarioEmailAndAtivoTrue(email)
                .stream()
                .map(vendedorConverter::paraVendedorDTOResponse)
                .toList();
    }

    public List<VendedorDTOResponse> buscarVendedoresInativos(String token) {
        String email = jwtUtil.extrairEmailToken(token.substring(7));

        usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        return vendedorRepository.findByUsuarioEmailAndAtivoFalse(email)
                .stream()
                .map(vendedorConverter::paraVendedorDTOResponse)
                .toList();
    }

    @Transactional
    public VendedorDTOResponse reativarVendedor(String token, Long idVendedor) {
        String email = jwtUtil.extrairEmailToken(token.substring(7));

        UsuarioEntity usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        VendedorEntity vendedor = vendedorRepository
                .findByIdVendedorAndUsuarioId(idVendedor, usuario.getId())
                .orElseThrow(() -> new RuntimeException("Vendedor não encontrado"));

        vendedor.setAtivo(true);

        return vendedorConverter.paraVendedorDTOResponse(
                vendedorRepository.save(vendedor)
        );
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
            throw new IllegalArgumentException("Informe uma comissão válida");
        }

        if (usuario.getComissaoTotal() == null) {
            throw new IllegalArgumentException(
                    "Configure primeiro a comissão total da empresa"
            );
        }

        if (comissaoVendedor > usuario.getComissaoTotal()) {
            throw new IllegalArgumentException(
                    "A comissão do vendedor não pode ser maior que a comissão total da empresa"
            );
        }
    }
}