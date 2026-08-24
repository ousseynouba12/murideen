package com.murideen.payment;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentWebhookController {

    private final PaymentService paymentService;

    public PaymentWebhookController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/wave/webhook")
    public ResponseEntity<Void> waveWebhook(@RequestBody Map<String, Object> payload) {
        paymentService.handleWebhook("CINETPAY", payload);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/orange-money/webhook")
    public ResponseEntity<Void> orangeMoneyWebhook(@RequestBody Map<String, Object> payload) {
        paymentService.handleWebhook("CINETPAY", payload);
        return ResponseEntity.ok().build();
    }
}
