package com.bookstore.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AdminPaymentResponseDTO {

    private Long paymentId;
    private Long userId;
    private String userName;
    private String userEmail;
    private String referenceType;
    private Long referenceId;
    private BigDecimal amount;
    private String status;
    private String paymentType;
    private String utr;
    private LocalDateTime createdAt;
    private LocalDateTime verifiedAt;

    public AdminPaymentResponseDTO() {
    }

    public AdminPaymentResponseDTO(Long paymentId, Long userId, String userName, String userEmail, String referenceType,
            Long referenceId, BigDecimal amount, String status, String paymentType, String utr, LocalDateTime createdAt,
            LocalDateTime verifiedAt) {
        this.paymentId = paymentId;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.referenceType = referenceType;
        this.referenceId = referenceId;
        this.amount = amount;
        this.status = status;
        this.paymentType = paymentType;
        this.utr = utr;
        this.createdAt = createdAt;
        this.verifiedAt = verifiedAt;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public void setReferenceType(String referenceType) {
        this.referenceType = referenceType;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Long referenceId) {
        this.referenceId = referenceId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentType() {
        return paymentType;
    }

    public void setPaymentType(String paymentType) {
        this.paymentType = paymentType;
    }

    public String getUtr() {
        return utr;
    }

    public void setUtr(String utr) {
        this.utr = utr;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }
}
