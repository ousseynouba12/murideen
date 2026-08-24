package com.murideen.review;

import com.murideen.review.dto.ReviewDto;
import com.murideen.review.dto.ReviewRequest;
import com.murideen.user.User;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public List<ReviewDto> list(@PathVariable Long productId) {
        return reviewService.listForProduct(productId);
    }

    @PostMapping
    public ReviewDto add(@PathVariable Long productId, @AuthenticationPrincipal User user,
                          @Valid @RequestBody ReviewRequest request) {
        return reviewService.add(productId, user, request);
    }
}
