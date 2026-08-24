package com.murideen.payment;

import com.murideen.order.Order;

import java.util.Map;

/**
 * Abstraction au-dessus du prestataire de paiement (CinetPay ou PayDunya).
 * Permet de changer de passerelle sans toucher au reste du code métier.
 */
public interface PaymentProvider {

    /** Nom technique du fournisseur, ex. "CINETPAY", "PAYDUNYA". */
    String getProviderName();

    /** Initie un paiement pour la commande et renvoie l'URL de paiement à afficher/rediriger. */
    PaymentInitiationResult initiate(Order order);

    /** Traite la notification (webhook) envoyée par le prestataire après paiement. */
    WebhookResult handleWebhook(Map<String, Object> payload);

    record PaymentInitiationResult(String paymentUrl, String externalReference) {}

    record WebhookResult(String externalReference, boolean success) {}
}
