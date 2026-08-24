package com.murideen.payment;

import com.murideen.order.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

/**
 * Intégration CinetPay (Wave / Orange Money via passerelle unique).
 * Doc : https://docs.cinetpay.com
 */
@Component
public class CinetPayPaymentProvider implements PaymentProvider {

    private static final Logger log = LoggerFactory.getLogger(CinetPayPaymentProvider.class);
    private static final String INIT_ENDPOINT = "https://api-checkout.cinetpay.com/v2/payment";

    private final PaymentProperties properties;
    private final RestTemplate restTemplate = new RestTemplate();

    public CinetPayPaymentProvider(PaymentProperties properties) {
        this.properties = properties;
    }

    @Override
    public String getProviderName() {
        return "CINETPAY";
    }

    @Override
    public PaymentInitiationResult initiate(Order order) {
        String transactionId = "MRD-" + order.getNumero() + "-" + UUID.randomUUID().toString().substring(0, 8);

        if (isDemoConfig()) {
            log.warn("CinetPay : clés API non configurées, retour d'une URL de paiement de démonstration.");
            return new PaymentInitiationResult(
                    "https://demo-paiement.murideen-demo.com/checkout/" + transactionId, transactionId);
        }

        Map<String, Object> body = Map.of(
                "apikey", properties.getCinetpay().getApiKey(),
                "site_id", properties.getCinetpay().getSiteId(),
                "transaction_id", transactionId,
                "amount", order.getTotal().intValue(),
                "currency", "XOF",
                "description", "Commande Murideen " + order.getNumero(),
                "customer_name", order.getClientNom(),
                "customer_phone_number", order.getClientTelephone(),
                "channels", order.getModePaiement().name().equals("WAVE") ? "WAVE" : "ORANGE_MONEY"
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(INIT_ENDPOINT, body, Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> data = response != null ? (Map<String, Object>) response.get("data") : null;
            String paymentUrl = data != null ? String.valueOf(data.get("payment_url")) : null;
            return new PaymentInitiationResult(paymentUrl, transactionId);
        } catch (Exception e) {
            log.error("Échec de l'appel à CinetPay pour la commande {}", order.getNumero(), e);
            return new PaymentInitiationResult(null, transactionId);
        }
    }

    @Override
    public WebhookResult handleWebhook(Map<String, Object> payload) {
        String transactionId = String.valueOf(payload.get("cpm_trans_id"));
        String status = String.valueOf(payload.get("cpm_result"));
        boolean success = "00".equals(status);
        return new WebhookResult(transactionId, success);
    }

    private boolean isDemoConfig() {
        String key = properties.getCinetpay().getApiKey();
        return key == null || key.isBlank() || key.startsWith("demo_");
    }
}
