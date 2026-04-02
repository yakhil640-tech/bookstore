package com.bookstore.mapper;

import org.springframework.stereotype.Component;

import com.bookstore.dto.payment.PaymentResponseDTO;
import com.bookstore.entity.Payment;

@Component
public class PaymentMapper {

    public PaymentResponseDTO toPaymentResponseDTO(Payment payment) {
        return new PaymentResponseDTO(
                payment.getId(),
                payment.getAmount(),
                payment.getStatus().name(),
                payment.getPaymentType().name(),
                payment.getReferenceType().name(),
                payment.getUpiLink(),
                payment.getQrPayload(),
                payment.getUtr(),
                payment.getVerifiedAt());
    }
}
