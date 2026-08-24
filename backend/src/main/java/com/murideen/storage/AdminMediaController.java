package com.murideen.storage;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/media")
@PreAuthorize("hasAnyRole('PROPRIETAIRE', 'GESTIONNAIRE')")
public class AdminMediaController {

    private final R2StorageService storageService;

    public AdminMediaController(R2StorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping(value = "/produits", consumes = "multipart/form-data")
    public Map<String, String> uploadProductImage(@RequestParam("fichier") MultipartFile fichier) {
        return storageService.uploadProductImage(fichier);
    }
}
