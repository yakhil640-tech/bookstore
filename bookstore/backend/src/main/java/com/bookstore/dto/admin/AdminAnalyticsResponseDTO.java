package com.bookstore.dto.admin;

import java.math.BigDecimal;

public class AdminAnalyticsResponseDTO {

    private Long totalUsers;
    private Long totalBooks;
    private Long totalOrders;
    private BigDecimal totalRevenue;
    private Long totalSubscriptions;

    public AdminAnalyticsResponseDTO() {
    }

    public AdminAnalyticsResponseDTO(Long totalUsers, Long totalBooks, Long totalOrders, BigDecimal totalRevenue,
            Long totalSubscriptions) {
        this.totalUsers = totalUsers;
        this.totalBooks = totalBooks;
        this.totalOrders = totalOrders;
        this.totalRevenue = totalRevenue;
        this.totalSubscriptions = totalSubscriptions;
    }

    public Long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(Long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public Long getTotalBooks() {
        return totalBooks;
    }

    public void setTotalBooks(Long totalBooks) {
        this.totalBooks = totalBooks;
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public Long getTotalSubscriptions() {
        return totalSubscriptions;
    }

    public void setTotalSubscriptions(Long totalSubscriptions) {
        this.totalSubscriptions = totalSubscriptions;
    }
}
