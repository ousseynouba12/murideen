package com.murideen.payment;

import com.murideen.common.ApiException;
import com.murideen.order.Order;
import com.murideen.order.OrderRepository;
import com.murideen.order.OrderStatus;
import com.murideen.order.PaymentMode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class PaymentService {

    private final List<PaymentProvider> providers;
    private final PaymentProperties properties;
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    public PaymentService(List<PaymentProvider> providers, PaymentProperties properties,
                           PaymentRepository paymentRepository, OrderRepository orderRepository) {
        this.providers = providers;
        this.properties = properties;
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
    }

    private PaymentProvider activeProvider() {
        return providers.stream()
                .filter(p -> p.getProviderName().equalsIgnoreCase(properties.getProvider()))
                .findFirst()
                .orElseThrow(() -> ApiException.badRequest("Aucune passerelle de paiement configurée."));
    }

    @Transactional
    public String initiatePaymentIfNeeded(Order order) {
        if (order.getModePaiement() == PaymentMode.LIVRAISON) {
            Payment payment = new Payment();
            payment.setOrder(order);
            payment.setProvider("LIVRAISON");
            payment.setStatut(PaymentStatus.EN_ATTENTE);
            payment.setMontant(order.getTotal());
            paymentRepository.save(payment);
            return null;
        }

        PaymentProvider provider = activeProvider();
        PaymentProvider.PaymentInitiationResult result = provider.initiate(order);

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setProvider(provider.getProviderName());
        payment.setStatut(PaymentStatus.EN_ATTENTE);
        payment.setReferenceExterne(result.externalReference());
        payment.setMontant(order.getTotal());
        paymentRepository.save(payment);

        return result.paymentUrl();
    }

    @Transactional
    public void handleWebhook(String providerName, Map<String, Object> payload) {
        PaymentProvider provider = providers.stream()
                .filter(p -> p.getProviderName().equalsIgnoreCase(providerName))
                .findFirst()
                .orElseThrow(() -> ApiException.badRequest("Fournisseur de paiement inconnu."));

        PaymentProvider.WebhookResult result = provider.handleWebhook(payload);

        Payment payment = paymentRepository.findByReferenceExterne(result.externalReference())
                .orElseThrow(() -> ApiException.notFound("Paiement introuvable pour cette référence."));

        payment.setStatut(result.success() ? PaymentStatus.REUSSI : PaymentStatus.ECHOUE);
        paymentRepository.save(payment);

        Order order = payment.getOrder();
        if (result.success() && order.getStatut() == OrderStatus.EN_ATTENTE) {
            order.setStatut(OrderStatus.CONFIRMEE);
            orderRepository.save(order);
        } else if (!result.success()) {
            order.setStatut(OrderStatus.ANNULEE);
            orderRepository.save(order);
        }
    }
}
