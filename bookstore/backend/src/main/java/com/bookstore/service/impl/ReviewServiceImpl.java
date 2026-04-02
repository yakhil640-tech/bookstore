package com.bookstore.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.entity.Book;
import com.bookstore.entity.Review;
import com.bookstore.entity.User;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.ReviewRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.service.ReadingService;
import com.bookstore.service.ReviewService;

@Service
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final ReadingService readingService;

    public ReviewServiceImpl(ReviewRepository reviewRepository,
            UserRepository userRepository,
            BookRepository bookRepository,
            ReadingService readingService) {
        this.reviewRepository = reviewRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.readingService = readingService;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Review> getReviewsByBookId(Long bookId) {
        return reviewRepository.findByBookIdOrderByCreatedAtDesc(bookId);
    }

    @Override
    public Review saveOrUpdateReview(Long userId, Long bookId, Integer rating, String comment) {
        if (!readingService.canAccessBook(userId, bookId)) {
            throw new BadRequestException("You can review only books you currently have full access to");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));

        Review review = reviewRepository.findByUserIdAndBookId(userId, bookId)
                .orElseGet(Review::new);
        review.setUser(user);
        review.setBook(book);
        review.setRating(rating);
        review.setComment(comment);

        return reviewRepository.save(review);
    }

    @Override
    @Transactional(readOnly = true)
    public double getAverageRating(Long bookId) {
        Double average = reviewRepository.findAverageRatingByBookId(bookId);
        return average == null ? 0.0 : Math.round(average * 10.0) / 10.0;
    }

    @Override
    @Transactional(readOnly = true)
    public long getReviewCount(Long bookId) {
        return reviewRepository.countByBookId(bookId);
    }
}
