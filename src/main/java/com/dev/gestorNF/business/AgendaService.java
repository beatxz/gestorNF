
package com.dev.gestorNF.business;

import com.dev.gestorNF.business.dto.out.AgendaResponse;
import com.dev.gestorNF.infrastructure.entity.out.AgendaEntity;
import com.dev.gestorNF.infrastructure.entity.out.UsuarioEntity;
import com.dev.gestorNF.infrastructure.repository.AgendaRepository;
import com.dev.gestorNF.infrastructure.repository.UsuarioRepository;
import com.dev.gestorNF.infrastructure.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AgendaService {

    private final AgendaRepository agendaRepository;
    private final UsuarioRepository usuarioRepository;
    private final JwtUtil jwtUtil;

    private UsuarioEntity usuarioAutenticado(String token) {
        String email = jwtUtil.extrairEmailToken(
                token.replaceFirst("(?i)^Bearer\\s+", "")
        );

        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Usuário não encontrado"
                ));
    }

    private AgendaResponse converter(AgendaEntity evento) {
        return new AgendaResponse(
                evento.getId(),
                evento.getTitulo(),
                evento.getDescricao(),
                evento.getInicio(),
                evento.getFim(),
                evento.getTipo(),
                evento.getCategoria(),
                evento.getCor(),
                evento.isConcluido()
        );
    }

    private void preencher(AgendaEntity evento, com.dev.gestorNF.business.dto.agenda.AgendaRequest request) {
        if (request.fim() != null &&
                !request.fim().isAfter(request.inicio())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "O horário final deve ser posterior ao inicial"
            );
        }

        if ("COMPROMISSO".equals(request.tipo()) &&
                request.fim() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Compromissos precisam de horário final"
            );
        }

        evento.setTitulo(request.titulo().trim());
        evento.setDescricao(request.descricao());
        evento.setInicio(request.inicio());
        evento.setFim(request.fim());
        evento.setTipo(request.tipo());
        evento.setCategoria(request.categoria().trim());
        evento.setCor(request.cor());
        evento.setConcluido(
                "TAREFA".equals(request.tipo()) && request.concluido()
        );
    }

    @Transactional(readOnly = true)
    public List<AgendaResponse> listar(
            String token,
            LocalDateTime inicio,
            LocalDateTime fim
    ) {
        Long usuarioId = usuarioAutenticado(token).getId();

        if (inicio.isAfter(fim)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Período inválido"
            );
        }

        return agendaRepository
                .buscarEventosNoPeriodo(
                        usuarioId, inicio, fim
                )
                .stream()
                .map(this::converter)
                .toList();
    }

    @Transactional
    public AgendaResponse criar(String token, com.dev.gestorNF.business.dto.agenda.AgendaRequest request) {
        UsuarioEntity usuario = usuarioAutenticado(token);

        AgendaEntity evento = new AgendaEntity();
        evento.setUsuario(usuario);
        preencher(evento, request);

        return converter(agendaRepository.save(evento));
    }

    @Transactional
    public AgendaResponse atualizar(
            String token,
            Long id,
            com.dev.gestorNF.business.dto.agenda.AgendaRequest request
    ) {
        Long usuarioId = usuarioAutenticado(token).getId();

        AgendaEntity evento = agendaRepository
                .findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Evento não encontrado"
                ));

        preencher(evento, request);

        return converter(agendaRepository.save(evento));
    }

    @Transactional
    public void excluir(String token, Long id) {
        Long usuarioId = usuarioAutenticado(token).getId();

        AgendaEntity evento = agendaRepository
                .findByIdAndUsuarioId(id, usuarioId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Evento não encontrado"
                ));

        agendaRepository.delete(evento);
    }
}
