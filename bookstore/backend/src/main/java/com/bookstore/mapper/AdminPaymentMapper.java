package com.bookstore.mapper;

import org.springframework.stereotype.Component;

import com.bookstore.dto.admin.AdminPaymentResponseDTO;
import com.bookstore.entity.Payment;
import com.bookstore.entity.enums.ReferenceType;

@Component
public class AdminPaymentMapper {

    public AdminPaymentResponseDTO toAdminPaymentResponseDTO(Payment payment) {
        Long referenceId = null;
        if (payment.getReferenceType() == ReferenceType.ORDER && payment.getOrder() != null) {
            referenceId = payment.getOrder().getId();
        } else if (payment.getReferenceType() == ReferenceType.SUBSCRIPTION && payment.getUserSubscription() != null) {
            referenceId = payment.getUserSubscription().getId();
        }

        return new AdminPaymentResponseDTO(
                payment.getId(),
                payment.getUser().getId(),
                payment.getUser().getFullName(),
                payment.getUser().getEmail(),
                payment.getReferenceType().name(),
                referenceId,
                payment.getAmount(),
                payment.getStatus().name(),
                payment.getPaymentType().name(),
                payment.getUtr(),
                payment.getCreatedAt(),
                payment.getVerifiedAt());
    }
}
