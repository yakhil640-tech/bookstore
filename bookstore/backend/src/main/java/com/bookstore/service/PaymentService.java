package com.bookstore.service;

import com.bookstore.entity.Payment;

public interface PaymentService {

    Payment generateOrderPayment(Long userId, Long orderId);

    Payment generateSubscriptionPayment(Long userId, Long subscriptionId);

    Payment verifyPayment(Long userId, Long paymentId, String utr);
}
