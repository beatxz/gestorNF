package com.dev.gestorNF.business;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine;

    @Value("${envio.email.remetente}")
    private String remetente;

    @Value("${envio.email.nomeRemetente}")
    private String nomeRemetente;

    @Value("${envio.email.url-verificacao}")
    private String urlVerificacao;


    public void enviarEmailVerificacao(
            String email,
            String nome,
            String token
    ) {

        try {

            MimeMessage mensagem = javaMailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(mensagem, true, StandardCharsets.UTF_8.name());

            helper.setFrom(
                    new InternetAddress(remetente, nomeRemetente));

            helper.setTo(email);

            helper.setSubject(
                    "Verificação de email - GestorNF"
            );

            Context context = new Context();

            context.setVariable("nome", nome);

            context.setVariable(
                    "linkVerificacao",
                    urlVerificacao + "?token=" + token
            );

            String template =
                    templateEngine.process(
                            "verificar-email",
                            context
                    );

            helper.setText(template, true);

            javaMailSender.send(mensagem);

        } catch (
                MessagingException |
                UnsupportedEncodingException e
        ) {

            throw new RuntimeException(
                    "Erro ao enviar email de verificação",
                    e
            );
        }
    }
}