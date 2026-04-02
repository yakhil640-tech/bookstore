package com.bookstore.service;

import java.util.List;

import com.bookstore.entity.UserSubscription;

public interface SubscriptionService {

    boolean isSubscriptionActive(Long userId);

    UserSubscription startSubscription(Long userId);

    List<UserSubscription> getSubscriptionsByUserId(Long userId);
}
