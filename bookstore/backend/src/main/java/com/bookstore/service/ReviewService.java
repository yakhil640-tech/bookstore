package com.bookstore.service;

import java.util.List;

import com.bookstore.entity.Review;

public interface ReviewService {

    List<Review> getReviewsByBookId(Long bookId);

    Review saveOrUpdateReview(Long userId, Long bookId, Integer rating, String comment);

    double getAverageRating(Long bookId);

    long getReviewCount(Long bookId);
}
