package com.dev.gestorNF.business;

import com.dev.gestorNF.business.dto.in.ClienteDTORequest;
import com.dev.gestorNF.business.dto.out.ClienteDTOResponse;
import com.dev.gestorNF.business.mapper.ClienteConverter;
import com.dev.gestorNF.infrastructure.entity.out.ClienteEntity;
import com.dev.gestorNF.infrastructure.entity.out.UsuarioEntity;
import com.dev.gestorNF.infrastructure.entity.out.VendedorEntity;
import com.dev.gestorNF.infrastructure.exception.ConflictException;
import com.dev.gestorNF.infrastructure.repository.ClienteRepository;
import com.dev.gestorNF.infrastructure.repository.UsuarioRepository;
import com.dev.gestorNF.infrastructure.repository.VendedorRepository;
import com.dev.gestorNF.infrastructure.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final ClienteConverter clienteConverter;
    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;
    private final VendedorRepository vendedorRepository;

    private VendedorEntity extrairVendedor(String token, Long idVendedor) {
        String email = jwtUtil.extrairEmailToken(token.substring(7));
        UsuarioEntity usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email não encontrado " + email));

        return vendedorRepository.findByIdVendedorAndUsuarioId(idVendedor, usuario.getId())
                .orElseThrow(() -> new RuntimeException("Vendedor não encontrado"));
    }

    public ClienteDTOResponse buscarPorCodigo(String token, Long idVendedor, String codigoCliente) {
        VendedorEntity vendedor = extrairVendedor(token, idVendedor);

        return clienteRepository.findByCodigoClienteAndVendedorIdVendedor(codigoCliente, vendedor.getIdVendedor())
                .map(clienteConverter::paraClienteDTOResponse)
                .orElse(null);
    }

    public ClienteDTOResponse cadastrarCliente(String token, Long idVendedor, ClienteDTORequest clienteDTORequest) {
        VendedorEntity vendedor = extrairVendedor(token, idVendedor);

        boolean existe = clienteRepository
                .findByCodigoClienteAndVendedorIdVendedor(clienteDTORequest.getCodigoCliente(), vendedor.getIdVendedor())
                .isPresent();

        if (existe) {
            throw new ConflictException("Código de cliente já cadastrado para este vendedor");
        }

        ClienteEntity clienteEntity = clienteConverter.paraClienteEntity(clienteDTORequest, vendedor);

        return clienteConverter.paraClienteDTOResponse(clienteRepository.save(clienteEntity));
    }

    public List<ClienteDTOResponse> listarClientes(String token, Long idVendedor) {
        VendedorEntity vendedor = extrairVendedor(token, idVendedor);

        return clienteRepository.findByVendedorIdVendedor(vendedor.getIdVendedor())
                .stream()
                .map(clienteConverter::paraClienteDTOResponse)
                .toList();
    }

    public ClienteDTOResponse editarCliente(String token, Long idVendedor, Long id, ClienteDTORequest clienteDTORequest) {
        VendedorEntity vendedor = extrairVendedor(token, idVendedor);

        ClienteEntity clienteEntity = clienteRepository.findByIdAndVendedorIdVendedor(id, vendedor.getIdVendedor())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        clienteEntity.setNomeEmpresa(clienteDTORequest.getNomeEmpresa());
        clienteEntity.setCodigoCliente(clienteDTORequest.getCodigoCliente());
        clienteEntity.setCnpj(clienteDTORequest.getCnpj());
        clienteEntity.setTelefone(clienteDTORequest.getTelefone());
        clienteEntity.setMunicipio(clienteDTORequest.getMunicipio());
        clienteEntity.setTransportadora(clienteDTORequest.getTransportadora());

        return clienteConverter.paraClienteDTOResponse(clienteRepository.save(clienteEntity));
    }

    public ClienteDTOResponse alterarStatusCliente(String token, Long idVendedor, Long id, boolean ativo) {
        VendedorEntity vendedor = extrairVendedor(token, idVendedor);

        ClienteEntity clienteEntity = clienteRepository.findByIdAndVendedorIdVendedor(id, vendedor.getIdVendedor())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado"));

        clienteEntity.setAtivo(ativo);

        return clienteConverter.paraClienteDTOResponse(clienteRepository.save(clienteEntity));
    }
    public ClienteEntity buscarOuCriarCliente(ClienteDTORequest clienteDTORequest, VendedorEntity vendedor) {
        ClienteEntity clienteEntity = clienteRepository.findByCodigoCliente(clienteDTORequest.getCodigoCliente())
                .orElseGet(() -> clienteConverter.paraClienteEntity(clienteDTORequest, vendedor));

        clienteEntity.setNomeEmpresa(clienteDTORequest.getNomeEmpresa());
        clienteEntity.setCnpj(clienteDTORequest.getCnpj());
        clienteEntity.setMunicipio(clienteDTORequest.getMunicipio());
        clienteEntity.setTransportadora(clienteDTORequest.getTransportadora());
        clienteEntity.setVendedor(vendedor);
        clienteEntity.setAtivo(true);

        return clienteRepository.save(clienteEntity);
    }
    public ClienteDTOResponse vincularClienteDaNota(
            String token,
            VendedorEntity vendedor,
            String codigoCliente,
            String nomeEmpresa,
            String cnpj,
            String municipio,
            String transportadora
    ) {
        String email = jwtUtil.extrairEmailToken(token.substring(7));

        UsuarioEntity usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email não encontrado " + email));

        ClienteEntity clienteEntity = clienteRepository
                .findByCodigoClienteAndVendedorUsuarioId(codigoCliente, usuario.getId())
                .orElse(null);

        if (clienteEntity != null) {
            if (nomeEmpresa != null && !nomeEmpresa.isBlank()) {
                clienteEntity.setNomeEmpresa(nomeEmpresa);
            }

            if (cnpj != null && !cnpj.isBlank()) {
                clienteEntity.setCnpj(cnpj);
            }

            if (municipio != null && !municipio.isBlank()) {
                clienteEntity.setMunicipio(municipio);
            }

            if (transportadora != null && !transportadora.isBlank()) {
                clienteEntity.setTransportadora(transportadora);
            }

            clienteEntity.setVendedor(vendedor);
            clienteEntity.setAtivo(true);

            return clienteConverter.paraClienteDTOResponse(
                    clienteRepository.save(clienteEntity)
            );
        }

        if (nomeEmpresa == null || nomeEmpresa.isBlank()) {
            throw new RuntimeException("Informe o nome da empresa para cadastrar um novo código de cliente");
        }

        ClienteDTORequest novoCliente = ClienteDTORequest.builder()
                .codigoCliente(codigoCliente)
                .nomeEmpresa(nomeEmpresa)
                .cnpj(cnpj)
                .municipio(municipio)
                .transportadora(transportadora)
                .build();

        ClienteEntity novoClienteEntity =
                clienteConverter.paraClienteEntity(novoCliente, vendedor);

        return clienteConverter.paraClienteDTOResponse(
                clienteRepository.save(novoClienteEntity)
        );
    }
}