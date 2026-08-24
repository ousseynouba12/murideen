package com.murideen.payment;

import com.murideen.order.Order;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.UUID;

/**
 * Intégration PayDunya (alternative à CinetPay pour Wave / Orange Money).
 * Doc : https://paydunya.com/developers
 */
@Component
public class PayDunyaPaymentProvider implements PaymentProvider {

    private static final Logger log = LoggerFactory.getLogger(PayDunyaPaymentProvider.class);
    private static final String INIT_ENDPOINT = "https://app.paydunya.com/api/v1/checkout-invoice/create";

    private final PaymentProperties properties;
    private final RestTemplate restTemplate = new RestTemplate();

    public PayDunyaPaymentProvider(PaymentProperties properties) {
        this.properties = properties;
    }

    @Override
    public String getProviderName() {
        return "PAYDUNYA";
    }

    @Override
    public PaymentInitiationResult initiate(Order order) {
        String transactionId = "MRD-" + order.getNumero() + "-" + UUID.randomUUID().toString().substring(0, 8);

        if (isDemoConfig()) {
            log.warn("PayDunya : clés API non configurées, retour d'une URL de paiement de démonstration.");
            return new PaymentInitiationResult(
                    "https://demo-paiement.murideen-demo.com/checkout/" + transactionId, transactionId);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.add("PAYDUNYA-MASTER-KEY", properties.getPaydunya().getMasterKey());
        headers.add("PAYDUNYA-PRIVATE-KEY", properties.getPaydunya().getPrivateKey());
        headers.add("PAYDUNYA-PUBLIC-KEY", properties.getPaydunya().getPublicKey());
        headers.add("PAYDUNYA-TOKEN", properties.getPaydunya().getToken());
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);

        Map<String, Object> invoice = Map.of(
                "total_amount", order.getTotal().intValue(),
                "description", "Commande Murideen " + order.getNumero()
        );
        Map<String, Object> body = Map.of("invoice", invoice, "custom_data", Map.of("order_reference", transactionId));

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(
                    INIT_ENDPOINT, new HttpEntity<>(body, headers), Map.class);
            String paymentUrl = response != null ? String.valueOf(response.get("response_text")) : null;
            return new PaymentInitiationResult(paymentUrl, transactionId);
        } catch (Exception e) {
            log.error("Échec de l'appel à PayDunya pour la commande {}", order.getNumero(), e);
            return new PaymentInitiationResult(null, transactionId);
        }
    }

    @Override
    public WebhookResult handleWebhook(Map<String, Object> payload) {
        String transactionId = String.valueOf(payload.get("custom_data"));
        String status = String.valueOf(payload.get("status"));
        boolean success = "completed".equalsIgnoreCase(status);
        return new WebhookResult(transactionId, success);
    }

    private boolean isDemoConfig() {
        String key = properties.getPaydunya().getMasterKey();
        return key == null || key.isBlank() || key.startsWith("demo_");
    }
}
