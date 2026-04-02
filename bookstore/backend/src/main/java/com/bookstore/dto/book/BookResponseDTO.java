package com.bookstore.dto.book;

import java.math.BigDecimal;

public class BookResponseDTO {

    private Long id;
    private String title;
    private String author;
    private String description;
    private BigDecimal price;
    private Integer previewPageCount;
    private Integer fullPageCount;
    private Boolean active;
    private Boolean previewAvailable;
    private Boolean fullContentAvailable;
    private String accessType;
    private Integer pageCount;
    private String message;
    private Double averageRating;
    private Long reviewCount;

    public BookResponseDTO() {
    }

    public BookResponseDTO(Long id, String title, String author, String description, BigDecimal price,
            Integer previewPageCount, Integer fullPageCount, Boolean active, Boolean previewAvailable,
            Boolean fullContentAvailable, String accessType, Integer pageCount, String message) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.description = description;
        this.price = price;
        this.previewPageCount = previewPageCount;
        this.fullPageCount = fullPageCount;
        this.active = active;
        this.previewAvailable = previewAvailable;
        this.fullContentAvailable = fullContentAvailable;
        this.accessType = accessType;
        this.pageCount = pageCount;
        this.message = message;
        this.averageRating = 0.0;
        this.reviewCount = 0L;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getPreviewPageCount() {
        return previewPageCount;
    }

    public void setPreviewPageCount(Integer previewPageCount) {
        this.previewPageCount = previewPageCount;
    }

    public Integer getFullPageCount() {
        return fullPageCount;
    }

    public void setFullPageCount(Integer fullPageCount) {
        this.fullPageCount = fullPageCount;
    }

    public Boolean isActive() {
        return active;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Boolean isPreviewAvailable() {
        return previewAvailable;
    }

    public Boolean getPreviewAvailable() {
        return previewAvailable;
    }

    public void setPreviewAvailable(Boolean previewAvailable) {
        this.previewAvailable = previewAvailable;
    }

    public Boolean isFullContentAvailable() {
        return fullContentAvailable;
    }

    public Boolean getFullContentAvailable() {
        return fullContentAvailable;
    }

    public void setFullContentAvailable(Boolean fullContentAvailable) {
        this.fullContentAvailable = fullContentAvailable;
    }

    public String getAccessType() {
        return accessType;
    }

    public void setAccessType(String accessType) {
        this.accessType = accessType;
    }

    public Integer getPageCount() {
        return pageCount;
    }

    public void setPageCount(Integer pageCount) {
        this.pageCount = pageCount;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Long getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Long reviewCount) {
        this.reviewCount = reviewCount;
    }
}
