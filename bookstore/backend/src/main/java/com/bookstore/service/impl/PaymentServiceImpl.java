package com.bookstore.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.entity.Order;
import com.bookstore.entity.Payment;
import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import com.bookstore.entity.UserSubscription;
import com.bookstore.entity.enums.OrderStatus;
import com.bookstore.entity.enums.PaymentStatus;
import com.bookstore.entity.enums.PaymentType;
import com.bookstore.entity.enums.ReferenceType;
import com.bookstore.entity.enums.SubscriptionStatus;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.exception.UnauthorizedException;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.PaymentRepository;
import com.bookstore.repository.RoleRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.repository.UserSubscriptionRepository;
import com.bookstore.service.PaymentService;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentServiceImpl.class);
    private static final String ROLE_USER = "ROLE_USER";
    private static final String ROLE_SUBSCRIBER = "ROLE_SUBSCRIBER";

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;

    public PaymentServiceImpl(PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            UserRepository userRepository,
            RoleRepository roleRepository,
            UserSubscriptionRepository userSubscriptionRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.userSubscriptionRepository = userSubscriptionRepository;
    }

    @Override
    public Payment generateOrderPayment(Long userId, Long orderId) {
        logger.info("Generating payment for order id: {} and user id: {}", orderId, userId);

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        validateOrderOwnership(userId, order);

        if (isOrderAlreadyCompleted(order)) {
            throw new BadRequestException("Payment is already completed for this order");
        }

        List<Payment> existingPayments = paymentRepository.findByOrderId(orderId);
        for (Payment existingPayment : existingPayments) {
            if (existingPayment.getStatus() == PaymentStatus.PENDING) {
                return existingPayment;
            }
        }

        Payment payment = new Payment();
        payment.setUser(order.getPurchaser());
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentType(PaymentType.UPI);
        payment.setReferenceType(ReferenceType.ORDER);
        payment.setStatus(PaymentStatus.PENDING);

        String upiLink = buildUpiLink(order.getTotalAmount(), "Order-" + order.getId());
        payment.setUpiLink(upiLink);
        payment.setQrPayload(upiLink);

        return paymentRepository.save(payment);
    }

    @Override
    public Payment generateSubscriptionPayment(Long userId, Long subscriptionId) {
        logger.info("Generating payment for subscription id: {} and user id: {}", subscriptionId, userId);

        UserSubscription subscription = userSubscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + subscriptionId));

        validateSubscriptionOwnership(userId, subscription);

        if (subscription.getStatus() == SubscriptionStatus.ACTIVE && subscription.getEndDate() != null
                && !subscription.getEndDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Subscription is already active");
        }

        List<Payment> existingPayments = paymentRepository.findByUserSubscriptionId(subscriptionId);
        for (Payment existingPayment : existingPayments) {
            if (existingPayment.getStatus() == PaymentStatus.PENDING) {
                return existingPayment;
            }
        }

        Payment payment = new Payment();
        payment.setUser(subscription.getUser());
        payment.setUserSubscription(subscription);
        payment.setAmount(subscription.getMonthlyPrice());
        payment.setPaymentType(PaymentType.UPI);
        payment.setReferenceType(ReferenceType.SUBSCRIPTION);
        payment.setStatus(PaymentStatus.PENDING);

        String upiLink = buildUpiLink(subscription.getMonthlyPrice(), "Subscription-" + subscription.getId());
        payment.setUpiLink(upiLink);
        payment.setQrPayload(upiLink);

        return paymentRepository.save(payment);
    }

    @Override
    public Payment verifyPayment(Long userId, Long paymentId, String utr) {
        logger.info("Verifying payment id: {} for user id: {}", paymentId, userId);

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        if (!payment.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You are not allowed to verify this payment");
        }

        String normalizedUtr = validatePaymentVerification(payment, utr);

        payment.setUtr(normalizedUtr);
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setVerifiedAt(LocalDateTime.now());

        if (payment.getOrder() != null) {
            payment.getOrder().setStatus(OrderStatus.COMPLETED);
        }

        if (payment.getUserSubscription() != null) {
            activateSubscription(payment.getUserSubscription());
        }

        return paymentRepository.save(payment);
    }

    private String validatePaymentVerification(Payment payment, String utr) {
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            throw new BadRequestException("Payment is already verified");
        }

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new BadRequestException("Only pending payments can be verified");
        }

        if (utr == null || utr.trim().isBlank()) {
            throw new BadRequestException("UTR is required for payment verification");
        }

        String normalizedUtr = utr.trim();
        if (paymentRepository.existsByUtrIgnoreCase(normalizedUtr)) {
            throw new BadRequestException("UTR is already used by another payment");
        }

        return normalizedUtr;
    }

    private void activateSubscription(UserSubscription subscription) {
        if (subscription.getStatus() != SubscriptionStatus.PENDING) {
            throw new BadRequestException("Only pending subscriptions can be activated");
        }

        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setStartDate(LocalDate.now());
        subscription.setEndDate(LocalDate.now().plusDays(subscription.getSubscriptionPlan().getDurationDays()));

        User user = subscription.getUser();
        user.getRoles().add(getOrCreateRole(ROLE_USER));
        user.getRoles().add(getOrCreateRole(ROLE_SUBSCRIBER));
        userRepository.save(user);
    }

    private boolean isOrderAlreadyCompleted(Order order) {
        return order.getStatus() == OrderStatus.COMPLETED || order.getStatus() == OrderStatus.PAID;
    }

    private void validateOrderOwnership(Long userId, Order order) {
        if (!order.getPurchaser().getId().equals(userId)) {
            throw new UnauthorizedException("You are not allowed to generate payment for this order");
        }
    }

    private void validateSubscriptionOwnership(Long userId, UserSubscription subscription) {
        if (!subscription.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You are not allowed to generate payment for this subscription");
        }
    }

    private Role getOrCreateRole(String roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(roleName);
                    return roleRepository.save(role);
                });
    }

    private String buildUpiLink(java.math.BigDecimal amount, String reference) {
        return "upi://pay?pa=bookstore@upi&pn=OnlineBookStore&am=" + amount + "&tn=" + reference;
    }
}
