package com.murideen.notification;

import com.murideen.order.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Point d'intégration WhatsApp/SMS à finaliser : le prestataire n'est pas encore choisi.
 * Cette implémentation se contente de journaliser l'intention d'envoi, sans échouer,
 * afin que le reste du flux de commande ne soit jamais bloqué par ce canal.
 */
@Service
public class WhatsAppNotificationService implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(WhatsAppNotificationService.class);

    @Override
    public void notifyOrderStatusChange(Order order) {
        log.info("[WhatsApp/SMS - intégration à finaliser] Notification pour la commande {} (statut: {}) au {}",
                order.getNumero(), order.getStatut(), order.getClientTelephone());
    }
}
