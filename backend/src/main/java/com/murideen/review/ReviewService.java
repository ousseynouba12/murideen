package com.murideen.review;

import com.murideen.common.ApiException;
import com.murideen.product.Product;
import com.murideen.product.ProductRepository;
import com.murideen.review.dto.ReviewDto;
import com.murideen.review.dto.ReviewRequest;
import com.murideen.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    public ReviewService(ReviewRepository reviewRepository, ProductRepository productRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> listForProduct(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream().map(ReviewDto::from).toList();
    }

    @Transactional
    public ReviewDto add(Long productId, User user, ReviewRequest request) {
        if (reviewRepository.existsByProductIdAndUserId(productId, user.getId())) {
            throw ApiException.conflict("Vous avez déjà laissé un avis sur ce produit.");
        }
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> ApiException.notFound("Produit introuvable."));

        Review review = new Review();
        review.setProduct(product);
        review.setUser(user);
        review.setNote(request.note());
        review.setCommentaire(request.commentaire());
        reviewRepository.save(review);

        recomputeRating(product);
        return ReviewDto.from(review);
    }

    private void recomputeRating(Product product) {
        List<Review> reviews = reviewRepository.findByProductIdOrderByCreatedAtDesc(product.getId());
        int nb = reviews.size();
        double moyenne = reviews.stream().mapToInt(Review::getNote).average().orElse(0);
        product.setNbAvis(nb);
        product.setNoteMoyenne(BigDecimal.valueOf(moyenne).setScale(2, RoundingMode.HALF_UP));
        productRepository.save(product);
    }
}
