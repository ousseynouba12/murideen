package com.murideen.storage;

import com.murideen.common.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Envoie les images produit vers Cloudflare R2 (API compatible S3),
 * en générant plusieurs tailles (miniature / moyenne / originale).
 */
@Service
public class R2StorageService {

    private static final Logger log = LoggerFactory.getLogger(R2StorageService.class);
    private static final Map<String, Integer> SIZES = new LinkedHashMap<>() {{
        put("thumb", 320);
        put("medium", 800);
    }};

    private final StorageProperties properties;

    public R2StorageService(StorageProperties properties) {
        this.properties = properties;
    }

    public Map<String, String> uploadProductImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw ApiException.badRequest("Le fichier envoyé est vide.");
        }
        String extension = "jpg";
        String baseName = UUID.randomUUID().toString();

        Map<String, String> urls = new LinkedHashMap<>();
        try {
            BufferedImage original = ImageIO.read(file.getInputStream());
            if (original == null) {
                throw ApiException.badRequest("Format d'image non supporté.");
            }

            urls.put("original", uploadImage(original, baseName + "-original." + extension));
            for (Map.Entry<String, Integer> entry : SIZES.entrySet()) {
                BufferedImage resized = resize(original, entry.getValue());
                urls.put(entry.getKey(), uploadImage(resized, baseName + "-" + entry.getKey() + "." + extension));
            }
        } catch (IOException e) {
            throw ApiException.badRequest("Impossible de lire le fichier image envoyé.");
        }
        return urls;
    }

    private BufferedImage resize(BufferedImage original, int targetWidth) {
        if (original.getWidth() <= targetWidth) return original;
        int targetHeight = (int) ((double) original.getHeight() / original.getWidth() * targetWidth);
        BufferedImage resized = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = resized.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.drawImage(original, 0, 0, targetWidth, targetHeight, null);
        g.dispose();
        return resized;
    }

    private String uploadImage(BufferedImage image, String key) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "jpg", baos);
        byte[] bytes = baos.toByteArray();

        if (isDemoConfig()) {
            log.warn("R2 non configuré (démo) : l'image \"{}\" n'a pas été réellement envoyée à R2.", key);
            return properties.getPublicBaseUrl() + "/" + key;
        }

        try (S3Client client = buildClient()) {
            client.putObject(
                    PutObjectRequest.builder()
                            .bucket(properties.getBucket())
                            .key(key)
                            .contentType("image/jpeg")
                            .build(),
                    RequestBody.fromInputStream(new ByteArrayInputStream(bytes), bytes.length)
            );
        }
        return properties.getPublicBaseUrl() + "/" + key;
    }

    private S3Client buildClient() {
        return S3Client.builder()
                .endpointOverride(URI.create(properties.getEndpoint()))
                .region(Region.of("auto"))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(properties.getAccessKey(), properties.getSecretKey())))
                .build();
    }

    private boolean isDemoConfig() {
        return properties.getAccessKey() == null || properties.getAccessKey().isBlank()
                || properties.getAccessKey().startsWith("demo_");
    }
}
