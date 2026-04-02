package com.bookstore.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.dto.review.ReviewRequestDTO;
import com.bookstore.dto.review.ReviewResponseDTO;
import com.bookstore.entity.Review;
import com.bookstore.exception.UnauthorizedException;
import com.bookstore.response.ApiResponse;
import com.bookstore.security.CustomUserDetails;
import com.bookstore.service.ReviewService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/books/{bookId}/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReviewResponseDTO>>> getReviews(@PathVariable Long bookId) {
        List<ReviewResponseDTO> reviews = reviewService.getReviewsByBookId(bookId)
                .stream()
                .map(this::toReviewResponseDTO)
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Reviews fetched successfully", reviews));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponseDTO>> saveReview(
            @PathVariable Long bookId,
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @Valid @RequestBody ReviewRequestDTO request) {
        if (currentUser == null) {
            throw new UnauthorizedException("Authentication is required to submit a review");
        }

        Review review = reviewService.saveOrUpdateReview(currentUser.getUserId(), bookId, request.getRating(),
                request.getComment());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review saved successfully", toReviewResponseDTO(review)));
    }

    private ReviewResponseDTO toReviewResponseDTO(Review review) {
        return new ReviewResponseDTO(
                review.getId(),
                review.getUser().getId(),
                review.getUser().getFullName(),
                review.getBook().getId(),
                review.getRating(),
                review.getComment(),
                review.getCreatedAt());
    }
}
