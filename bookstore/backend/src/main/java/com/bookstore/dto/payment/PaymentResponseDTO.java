package com.bookstore.dto.payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;


public class PaymentResponseDTO {

    private Long paymentId;
    private BigDecimal amount;
    private String status;
    private String paymentType;
    private String referenceType;
    private String upiLink;
    private String qrPayload;
    private String utr;
    private LocalDateTime verifiedAt;


    public PaymentResponseDTO() {
    }

    public PaymentResponseDTO(Long paymentId, BigDecimal amount, String status, String paymentType, String referenceType, String upiLink, String qrPayload, String utr, LocalDateTime verifiedAt) {
        this.paymentId = paymentId;
        this.amount = amount;
        this.status = status;
        this.paymentType = paymentType;
        this.referenceType = referenceType;
        this.upiLink = upiLink;
        this.qrPayload = qrPayload;
        this.utr = utr;
        this.verifiedAt = verifiedAt;
    }

    public Long getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Long paymentId) {
        this.paymentId = paymentId;
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

    public String getReferenceType() {
        return referenceType;
    }

    public void setReferenceType(String referenceType) {
        this.referenceType = referenceType;
    }

    public String getUpiLink() {
        return upiLink;
    }

    public void setUpiLink(String upiLink) {
        this.upiLink = upiLink;
    }

    public String getQrPayload() {
        return qrPayload;
    }

    public void setQrPayload(String qrPayload) {
        this.qrPayload = qrPayload;
    }

    public String getUtr() {
        return utr;
    }

    public void setUtr(String utr) {
        this.utr = utr;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }
}

