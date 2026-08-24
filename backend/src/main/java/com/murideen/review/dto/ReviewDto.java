package com.murideen.review.dto;

import com.murideen.review.Review;

import java.time.Instant;

public record ReviewDto(Long id, String auteur, int note, String commentaire, Instant createdAt) {
    public static ReviewDto from(Review r) {
        return new ReviewDto(r.getId(), r.getUser().getNom(), r.getNote(), r.getCommentaire(), r.getCreatedAt());
    }
}
