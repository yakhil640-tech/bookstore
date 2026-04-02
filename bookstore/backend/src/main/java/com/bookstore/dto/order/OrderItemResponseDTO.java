package com.bookstore.dto.order;

import java.math.BigDecimal;


public class OrderItemResponseDTO {

    private Long bookId;
    private String title;
    private BigDecimal price;


    public OrderItemResponseDTO() {
    }

    public OrderItemResponseDTO(Long bookId, String title, BigDecimal price) {
        this.bookId = bookId;
        this.title = title;
        this.price = price;
    }

    public Long getBookId() {
        return bookId;
    }

    public void setBookId(Long bookId) {
        this.bookId = bookId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }
}

