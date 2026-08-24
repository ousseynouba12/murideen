package com.murideen.promotion;

import com.murideen.promotion.dto.PromotionDto;
import com.murideen.promotion.dto.PromotionUpsertRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/promotions")
@PreAuthorize("hasAnyRole('PROPRIETAIRE', 'GESTIONNAIRE')")
public class AdminPromotionController {

    private final PromotionService promotionService;

    public AdminPromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @GetMapping
    public List<PromotionDto> list() {
        return promotionService.listAll();
    }

    @PostMapping
    public ResponseEntity<PromotionDto> create(@Valid @RequestBody PromotionUpsertRequest request) {
        return ResponseEntity.ok(promotionService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PromotionDto> update(@PathVariable Long id, @Valid @RequestBody PromotionUpsertRequest request) {
        return ResponseEntity.ok(promotionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        promotionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
