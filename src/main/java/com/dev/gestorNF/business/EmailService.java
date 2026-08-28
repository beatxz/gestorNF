package com.dev.gestorNF.business;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final TemplateEngine templateEngine;

    @Value("${resend.api.key}")
    private String apiKey;

    @Value("${envio.email.remetente}")
    private String remetente;

    @Value("${envio.email.nomeRemetente}")
    private String nomeRemetente;

    @Value("${envio.email.url-verificacao}")
    private String urlVerificacao;

    @Value("${envio.email.url-recuperacao}")
    private String urlRecuperacao;


    public void enviarEmailVerificacao(
            String email,
            String nome,
            String token
    ) {

        try {

            Resend resend = new Resend(apiKey);

            Context context = new Context();

            context.setVariable("nome", nome);

            context.setVariable(
                    "linkVerificacao",
                    urlVerificacao + "?token=" + token
            );

            String template = templateEngine.process(
                    "verificar-email",
                    context
            );

            CreateEmailOptions emailRequest =
                    CreateEmailOptions.builder()
                            .from(nomeRemetente + " <" + remetente + ">")
                            .to(email)
                            .subject("Verificação de email - GestorNF")
                            .html(template)
                            .build();

            resend.emails().send(emailRequest);

        } catch (Exception e) {

            throw new RuntimeException(
                    "Erro ao enviar email de verificação",
                    e
            );
        }
    }


    public void enviarEmailRecuperacaoSenha(
            String email,
            String nome,
            String token
    ) {

        try {

            Resend resend = new Resend(apiKey);

            Context context = new Context();

            context.setVariable("nome", nome);

            context.setVariable(
                    "linkRecuperacao",
                    urlRecuperacao + "?token=" + token
            );

            String template = templateEngine.process(
                    "recuperar-senha",
                    context
            );

            CreateEmailOptions emailRequest =
                    CreateEmailOptions.builder()
                            .from(nomeRemetente + " <" + remetente + ">")
                            .to(email)
                            .subject("Recuperação de senha - GestorNF")
                            .html(template)
                            .build();

            resend.emails().send(emailRequest);

        } catch (Exception e) {

            throw new RuntimeException(
                    "Erro ao enviar email de recuperação de senha",
                    e
            );
        }
    }
}