package com.dev.gestorNF.business;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ImportacaoRateLimitService {

    private static final int LIMITE_REQUISICOES = 10;
    private static final long JANELA_SEGUNDOS = 60;

    private final Map<String, ControleImportacao> controles =
            new ConcurrentHashMap<>();

    public void verificar(String email) {

        Instant agora = Instant.now();

        ControleImportacao controle = controles.computeIfAbsent(
                email, chave -> new ControleImportacao(agora, 0));

        synchronized (controle) {

            long segundos =
                    agora.getEpochSecond() - controle.inicioJanela.getEpochSecond();

            if (segundos >= JANELA_SEGUNDOS) {

                controle.inicioJanela = agora;
                controle.quantidade = 0;
            }

            if (controle.quantidade >= LIMITE_REQUISICOES) {
                throw new RuntimeException("Muitas importações em pouco tempo. Aguarde um minuto e tente novamente.");
            }

            controle.quantidade++;
        }
    }

    private static class ControleImportacao {

        private Instant inicioJanela;
        private int quantidade;

        private ControleImportacao(
                Instant inicioJanela,
                int quantidade
        ) {
            this.inicioJanela = inicioJanela;
            this.quantidade = quantidade;
        }
    }
}