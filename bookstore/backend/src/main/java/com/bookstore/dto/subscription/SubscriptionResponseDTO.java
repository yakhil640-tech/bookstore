package com.bookstore.dto.subscription;

import java.math.BigDecimal;
import java.time.LocalDate;


public class SubscriptionResponseDTO {

    private Long subscriptionId;
    private Long userId;
    private String planName;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal monthlyPrice;


    public SubscriptionResponseDTO() {
    }

    public SubscriptionResponseDTO(Long subscriptionId, Long userId, String planName, String status, LocalDate startDate, LocalDate endDate, BigDecimal monthlyPrice) {
        this.subscriptionId = subscriptionId;
        this.userId = userId;
        this.planName = planName;
        this.status = status;
        this.startDate = startDate;
        this.endDate = endDate;
        this.monthlyPrice = monthlyPrice;
    }

    public Long getSubscriptionId() {
        return subscriptionId;
    }

    public void setSubscriptionId(Long subscriptionId) {
        this.subscriptionId = subscriptionId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getPlanName() {
        return planName;
    }

    public void setPlanName(String planName) {
        this.planName = planName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public BigDecimal getMonthlyPrice() {
        return monthlyPrice;
    }

    public void setMonthlyPrice(BigDecimal monthlyPrice) {
        this.monthlyPrice = monthlyPrice;
    }
}

