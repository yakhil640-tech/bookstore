package com.bookstore.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bookstore.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByBookIdOrderByCreatedAtDesc(Long bookId);

    Optional<Review> findByUserIdAndBookId(Long userId, Long bookId);

    long countByBookId(Long bookId);

    @Query("select coalesce(avg(r.rating), 0) from Review r where r.book.id = :bookId")
    Double findAverageRatingByBookId(@Param("bookId") Long bookId);
}
