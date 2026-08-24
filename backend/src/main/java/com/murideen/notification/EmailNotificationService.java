package com.murideen.notification;

import com.murideen.order.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    private final JavaMailSender mailSender;

    @Value("${murideen.mail.from}")
    private String from;

    public EmailNotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Override
    @Async
    public void notifyOrderStatusChange(Order order) {
        if (order.getClientEmail() == null || order.getClientEmail().isBlank()) {
            log.info("Commande {} : pas d'e-mail client, notification ignorée.", order.getNumero());
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(order.getClientEmail());
            message.setSubject("Murideen — Mise à jour de votre commande " + order.getNumero());
            message.setText(bodyFor(order));
            mailSender.send(message);
            log.info("E-mail de suivi envoyé pour la commande {}", order.getNumero());
        } catch (Exception e) {
            log.error("Échec de l'envoi de l'e-mail pour la commande {}", order.getNumero(), e);
        }
    }

    private String bodyFor(Order order) {
        String statutLisible = switch (order.getStatut()) {
            case EN_ATTENTE -> "en attente de confirmation";
            case CONFIRMEE -> "confirmée";
            case EXPEDIEE -> "expédiée";
            case LIVREE -> "livrée";
            case ANNULEE -> "annulée";
        };
        return "Bonjour " + order.getClientNom() + ",\n\n"
                + "Votre commande " + order.getNumero() + " est maintenant " + statutLisible + ".\n\n"
                + "Merci de votre confiance,\nL'équipe Murideen";
    }
}
