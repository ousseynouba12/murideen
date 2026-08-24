package com.murideen.promotion;

import com.murideen.common.ApiException;
import com.murideen.product.Category;
import com.murideen.product.CategoryRepository;
import com.murideen.promotion.dto.PromotionDto;
import com.murideen.promotion.dto.PromotionUpsertRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final CategoryRepository categoryRepository;

    public PromotionService(PromotionRepository promotionRepository, CategoryRepository categoryRepository) {
        this.promotionRepository = promotionRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<PromotionDto> listAll() {
        return promotionRepository.findAll().stream().map(PromotionDto::from).toList();
    }

    public Promotion findValidByCode(String code) {
        Promotion promotion = promotionRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> ApiException.badRequest("Ce code promo n'existe pas."));
        if (!promotion.estValideMaintenant()) {
            throw ApiException.badRequest("Ce code promo n'est plus valide.");
        }
        return promotion;
    }

    @Transactional
    public PromotionDto create(PromotionUpsertRequest request) {
        Promotion promotion = new Promotion();
        apply(promotion, request);
        promotionRepository.save(promotion);
        return PromotionDto.from(promotion);
    }

    @Transactional
    public PromotionDto update(Long id, PromotionUpsertRequest request) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Promotion introuvable."));
        apply(promotion, request);
        promotionRepository.save(promotion);
        return PromotionDto.from(promotion);
    }

    @Transactional
    public void delete(Long id) {
        promotionRepository.deleteById(id);
    }

    private void apply(Promotion promotion, PromotionUpsertRequest request) {
        promotion.setCode(request.code().toUpperCase().trim());
        promotion.setType(PromotionType.valueOf(request.type()));
        promotion.setValeur(request.valeur() == null ? java.math.BigDecimal.ZERO : request.valeur());
        promotion.setDateDebut(request.dateDebut());
        promotion.setDateFin(request.dateFin());
        promotion.setActif(request.actif());
        if (request.categoryId() != null) {
            Category category = categoryRepository.findById(request.categoryId())
                    .orElseThrow(() -> ApiException.badRequest("Catégorie invalide."));
            promotion.setCategory(category);
        } else {
            promotion.setCategory(null);
        }
    }
}
