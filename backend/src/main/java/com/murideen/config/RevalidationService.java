package com.murideen.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Déclenche la revalidation à la demande des pages ISR de Next.js (catalogue, fiche produit)
 * lorsqu'un produit est modifié depuis le back-office.
 */
@Service
public class RevalidationService {

    private static final Logger log = LoggerFactory.getLogger(RevalidationService.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${murideen.frontend.revalidate-url}")
    private String revalidateUrl;

    @Value("${murideen.frontend.revalidate-secret}")
    private String secret;

    @Async
    public void revalidateProduct(String slug) {
        try {
            restTemplate.postForObject(revalidateUrl, Map.of("secret", secret, "path", "/produit/" + slug), String.class);
            restTemplate.postForObject(revalidateUrl, Map.of("secret", secret, "path", "/catalogue"), String.class);
        } catch (Exception e) {
            log.warn("Impossible de déclencher la revalidation ISR pour le produit {}: {}", slug, e.getMessage());
        }
    }
}
