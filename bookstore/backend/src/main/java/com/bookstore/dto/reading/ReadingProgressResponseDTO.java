package com.bookstore.dto.reading;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ReadingProgressResponseDTO {

    private Long bookId;
    private Integer lastPage;
    private BigDecimal progressPercent;
    private Integer maxPage;
    private LocalDateTime lastReadAt;

    public ReadingProgressResponseDTO() {
    }

    public ReadingProgressResponseDTO(Long bookId, Integer lastPage, BigDecimal progressPercent, Integer maxPage,
            LocalDateTime lastReadAt) {
        this.bookId = bookId;
        this.lastPage = lastPage;
        this.progressPercent = progressPercent;
        this.maxPage = maxPage;
        this.lastReadAt = lastReadAt;
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
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

    public Integer getMaxPage() {
        return maxPage;
    }

    public void setMaxPage(Integer maxPage) {
        this.maxPage = maxPage;
    }

    public LocalDateTime getLastReadAt() {
        return lastReadAt;
    }

    public void setLastReadAt(LocalDateTime lastReadAt) {
        this.lastReadAt = lastReadAt;
    }
}
