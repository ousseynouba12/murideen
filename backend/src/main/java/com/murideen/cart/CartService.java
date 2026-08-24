package com.murideen.cart;

import com.murideen.cart.dto.*;
import com.murideen.common.ApiException;
import com.murideen.product.ProductVariant;
import com.murideen.product.ProductVariantRepository;
import com.murideen.promotion.Promotion;
import com.murideen.promotion.PromotionService;
import com.murideen.promotion.PromotionType;
import com.murideen.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository variantRepository;
    private final PromotionService promotionService;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository,
                        ProductVariantRepository variantRepository, PromotionService promotionService) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.variantRepository = variantRepository;
        this.promotionService = promotionService;
    }

    @Transactional
    public CartDto getCart(User user, String sessionToken) {
        return toDto(resolveCart(user, sessionToken));
    }

    @Transactional
    public CartDto addItem(User user, String sessionToken, AddCartItemRequest request) {
        Cart cart = resolveCart(user, sessionToken);
        ProductVariant variant = variantRepository.findById(request.productVariantId())
                .orElseThrow(() -> ApiException.notFound("Variante introuvable."));
        if (variant.getStock() < request.quantite()) {
            throw ApiException.badRequest("Stock insuffisant pour cet article.");
        }
        var existing = cart.getItems().stream()
                .filter(i -> i.getProductVariant().getId().equals(variant.getId()))
                .findFirst();
        if (existing.isPresent()) {
            existing.get().setQuantite(existing.get().getQuantite() + request.quantite());
        } else {
            CartItem item = new CartItem();
            item.setCart(cart);
            item.setProductVariant(variant);
            item.setQuantite(request.quantite());
            cart.getItems().add(item);
        }
        cartRepository.save(cart);
        return toDto(cart);
    }

    @Transactional
    public CartDto updateItem(User user, String sessionToken, Long itemId, UpdateCartItemRequest request) {
        Cart cart = resolveCart(user, sessionToken);
        CartItem item = cart.getItems().stream().filter(i -> i.getId().equals(itemId)).findFirst()
                .orElseThrow(() -> ApiException.notFound("Article introuvable dans le panier."));
        if (item.getProductVariant().getStock() < request.quantite()) {
            throw ApiException.badRequest("Stock insuffisant pour cet article.");
        }
        item.setQuantite(request.quantite());
        cartRepository.save(cart);
        return toDto(cart);
    }

    @Transactional
    public CartDto removeItem(User user, String sessionToken, Long itemId) {
        Cart cart = resolveCart(user, sessionToken);
        cart.getItems().removeIf(i -> i.getId().equals(itemId));
        cartRepository.save(cart);
        return toDto(cart);
    }

    @Transactional
    public CartDto applyPromo(User user, String sessionToken, String code) {
        Cart cart = resolveCart(user, sessionToken);
        Promotion promotion = promotionService.findValidByCode(code);
        cart.setPromotion(promotion);
        cartRepository.save(cart);
        return toDto(cart);
    }

    private Cart resolveCart(User user, String sessionToken) {
        if (user != null) {
            return cartRepository.findByUserId(user.getId()).orElseGet(() -> {
                Cart cart = new Cart();
                cart.setUser(user);
                cart.setSessionToken(UUID.randomUUID().toString());
                return cartRepository.save(cart);
            });
        }
        if (sessionToken != null) {
            var existing = cartRepository.findBySessionToken(sessionToken);
            if (existing.isPresent()) return existing.get();
        }
        Cart cart = new Cart();
        cart.setSessionToken(UUID.randomUUID().toString());
        return cartRepository.save(cart);
    }

    private CartDto toDto(Cart cart) {
        List<CartItemDto> items = cart.getItems().stream().map(i -> {
            ProductVariant v = i.getProductVariant();
            BigDecimal prix = v.getProduct().getPrix();
            String image = v.getProduct().getImages().isEmpty() ? null : v.getProduct().getImages().get(0);
            return new CartItemDto(
                    i.getId(), v.getId(), v.getProduct().getId(), v.getProduct().getNom(),
                    v.getProduct().getSlug(), image, v.getTaille(), v.getCouleur(),
                    i.getQuantite(), v.getStock(), prix, prix.multiply(BigDecimal.valueOf(i.getQuantite()))
            );
        }).toList();

        BigDecimal sousTotal = items.stream().map(CartItemDto::sousTotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal remise = BigDecimal.ZERO;
        String codePromo = null;

        if (cart.getPromotion() != null && cart.getPromotion().estValideMaintenant()) {
            Promotion p = cart.getPromotion();
            codePromo = p.getCode();
            if (p.getType() == PromotionType.POURCENTAGE) {
                remise = sousTotal.multiply(p.getValeur()).divide(BigDecimal.valueOf(100));
            } else if (p.getType() == PromotionType.MONTANT_FIXE) {
                remise = p.getValeur().min(sousTotal);
            }
        }

        int totalArticles = items.stream().mapToInt(CartItemDto::quantite).sum();

        return new CartDto(cart.getSessionToken(), items, sousTotal, remise, codePromo, totalArticles);
    }
}
