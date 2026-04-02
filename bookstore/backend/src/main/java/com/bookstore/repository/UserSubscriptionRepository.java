package com.bookstore.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bookstore.entity.UserSubscription;
import com.bookstore.entity.enums.SubscriptionStatus;

public interface UserSubscriptionRepository extends JpaRepository<UserSubscription, Long> {

    List<UserSubscription> findByUserIdAndStatus(Long userId, SubscriptionStatus status);

    List<UserSubscription> findByUserId(Long userId);

    List<UserSubscription> findByStatusAndEndDateBefore(SubscriptionStatus status, LocalDate endDate);

    boolean existsByUserIdAndStatusAndEndDateGreaterThanEqual(Long userId, SubscriptionStatus status, LocalDate endDate);
}
