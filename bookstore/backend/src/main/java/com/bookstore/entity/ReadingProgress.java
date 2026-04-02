package com.bookstore.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.ToString;

@Entity
@Table(name = "reading_progress", uniqueConstraints = {
        @UniqueConstraint(name = "uk_reading_progress_user_book", columnNames = { "user_id", "book_id" })
})
@ToString(exclude = { "user", "book" })
public class ReadingProgress extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @NotNull
    @PositiveOrZero
    @Column(nullable = false)
    private Integer lastPage = 0;

    @NotNull
    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal progressPercent = BigDecimal.ZERO;

    private LocalDateTime lastReadAt;


    public ReadingProgress() {
    }

    public ReadingProgress(User user, Book book, Integer lastPage, BigDecimal progressPercent, LocalDateTime lastReadAt) {
        this.user = user;
        this.book = book;
        this.lastPage = lastPage;
        this.progressPercent = progressPercent;
        this.lastReadAt = lastReadAt;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }

    public Integer getLastPage() {
        return lastPage;
    }

    public void setLastPage(Integer lastPage) {
        this.lastPage = lastPage;
    }

    public BigDecimal getProgressPercent() {
        return progressPercent;
    }

    public void setProgressPercent(BigDecimal progressPercent) {
        this.progressPercent = progressPercent;
    }

    public LocalDateTime getLastReadAt() {
        return lastReadAt;
    }

    public void setLastReadAt(LocalDateTime lastReadAt) {
        this.lastReadAt = lastReadAt;
    }
}

