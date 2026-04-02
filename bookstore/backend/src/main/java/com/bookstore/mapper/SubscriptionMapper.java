package com.bookstore.mapper;

import org.springframework.stereotype.Component;

import com.bookstore.dto.subscription.SubscriptionResponseDTO;
import com.bookstore.entity.UserSubscription;

@Component
public class SubscriptionMapper {

    public SubscriptionResponseDTO toSubscriptionResponseDTO(UserSubscription subscription) {
        return new SubscriptionResponseDTO(
                subscription.getId(),
                subscription.getUser().getId(),
                subscription.getSubscriptionPlan().getName(),
                subscription.getStatus().name(),
                subscription.getStartDate(),
                subscription.getEndDate(),
                subscription.getMonthlyPrice());
    }
}
