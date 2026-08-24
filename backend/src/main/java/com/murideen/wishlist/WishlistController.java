package com.murideen.wishlist;

import com.murideen.common.ApiException;
import com.murideen.product.Product;
import com.murideen.product.ProductRepository;
import com.murideen.product.dto.ProductDto;
import com.murideen.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/me/wishlist")
public class WishlistController {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;

    public WishlistController(WishlistRepository wishlistRepository, ProductRepository productRepository) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<ProductDto> list(@AuthenticationPrincipal User user) {
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(item -> ProductDto.from(item.getProduct()))
                .toList();
    }

    @PostMapping("/{productId}")
    public ResponseEntity<Void> add(@AuthenticationPrincipal User user, @PathVariable Long productId) {
        if (wishlistRepository.findByUserIdAndProductId(user.getId(), productId).isPresent()) {
            return ResponseEntity.ok().build();
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> ApiException.notFound("Produit introuvable."));
        WishlistItem item = new WishlistItem();
        item.setUser(user);
        item.setProduct(product);
        wishlistRepository.save(item);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Void> remove(@AuthenticationPrincipal User user, @PathVariable Long productId) {
        wishlistRepository.findByUserIdAndProductId(user.getId(), productId).ifPresent(wishlistRepository::delete);
        return ResponseEntity.noContent().build();
    }
}
