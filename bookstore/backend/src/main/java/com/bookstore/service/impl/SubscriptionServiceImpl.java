package com.bookstore.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.entity.Payment;
import com.bookstore.entity.Role;
import com.bookstore.entity.SubscriptionPlan;
import com.bookstore.entity.User;
import com.bookstore.entity.UserSubscription;
import com.bookstore.entity.enums.PaymentStatus;
import com.bookstore.entity.enums.PaymentType;
import com.bookstore.entity.enums.ReferenceType;
import com.bookstore.entity.enums.SubscriptionStatus;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.repository.PaymentRepository;
import com.bookstore.repository.RoleRepository;
import com.bookstore.repository.SubscriptionPlanRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.repository.UserSubscriptionRepository;
import com.bookstore.service.SubscriptionService;

@Service
@Transactional
public class SubscriptionServiceImpl implements SubscriptionService {

    private static final Logger logger = LoggerFactory.getLogger(SubscriptionServiceImpl.class);
    private static final String ROLE_USER = "ROLE_USER";
    private static final BigDecimal DEFAULT_SUBSCRIPTION_PRICE = new BigDecimal("299.00");

    private final UserSubscriptionRepository userSubscriptionRepository;
    private final UserRepository userRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final RoleRepository roleRepository;
    private final PaymentRepository paymentRepository;

    public SubscriptionServiceImpl(UserSubscriptionRepository userSubscriptionRepository,
            UserRepository userRepository,
            SubscriptionPlanRepository subscriptionPlanRepository,
            RoleRepository roleRepository,
            PaymentRepository paymentRepository) {
        this.userSubscriptionRepository = userSubscriptionRepository;
        this.userRepository = userRepository;
        this.subscriptionPlanRepository = subscriptionPlanRepository;
        this.roleRepository = roleRepository;
        this.paymentRepository = paymentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isSubscriptionActive(Long userId) {
        logger.debug("Checking active subscription for user id: {}", userId);

        if (userId == null) {
            return false;
        }

        return userSubscriptionRepository.existsByUserIdAndStatusAndEndDateGreaterThanEqual(userId,
                SubscriptionStatus.ACTIVE,
                LocalDate.now());
    }

    @Override
    public UserSubscription startSubscription(Long userId) {
        logger.info("Starting subscription for user id: {}", userId);

        if (userId == null) {
            throw new BadRequestException("User id is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (isSubscriptionActive(userId)) {
            throw new BadRequestException("User already has an active subscription");
        }

        List<UserSubscription> pendingSubscriptions = userSubscriptionRepository.findByUserIdAndStatus(userId,
                SubscriptionStatus.PENDING);
        if (!pendingSubscriptions.isEmpty()) {
            return pendingSubscriptions.get(0);
        }

        SubscriptionPlan plan = subscriptionPlanRepository.findFirstByActiveTrue()
                .orElseGet(this::createDefaultMonthlyPlan);

        user.getRoles().add(getOrCreateRole(ROLE_USER));
        userRepository.save(user);

        UserSubscription userSubscription = new UserSubscription();
        userSubscription.setUser(user);
        userSubscription.setSubscriptionPlan(plan);
        userSubscription.setStartDate(LocalDate.now());
        userSubscription.setEndDate(LocalDate.now().plusDays(plan.getDurationDays()));
        userSubscription.setMonthlyPrice(plan.getPrice());
        userSubscription.setStatus(SubscriptionStatus.PENDING);

        UserSubscription savedSubscription = userSubscriptionRepository.save(userSubscription);
        createPendingSubscriptionPayment(user, savedSubscription, plan);

        return savedSubscription;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSubscription> getSubscriptionsByUserId(Long userId) {
        logger.debug("Fetching subscriptions for user id: {}", userId);
        return userSubscriptionRepository.findByUserId(userId);
    }

    private void createPendingSubscriptionPayment(User user, UserSubscription subscription, SubscriptionPlan plan) {
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setUserSubscription(subscription);
        payment.setAmount(plan.getPrice());
        payment.setPaymentType(PaymentType.UPI);
        payment.setReferenceType(ReferenceType.SUBSCRIPTION);
        payment.setStatus(PaymentStatus.PENDING);

        String upiLink = buildUpiLink(plan.getPrice(), "Subscription-" + subscription.getId());
        payment.setUpiLink(upiLink);
        payment.setQrPayload(upiLink);

        paymentRepository.save(payment);
    }

    private SubscriptionPlan createDefaultMonthlyPlan() {
        SubscriptionPlan plan = new SubscriptionPlan();
        plan.setName("Monthly Plan");
        plan.setDurationDays(30);
        plan.setPrice(DEFAULT_SUBSCRIPTION_PRICE);
        plan.setActive(true);
        return subscriptionPlanRepository.save(plan);
    }

    private Role getOrCreateRole(String roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(roleName);
                    return roleRepository.save(role);
                });
    }

    private String buildUpiLink(BigDecimal amount, String reference) {
        return "upi://pay?pa=bookstore@upi&pn=OnlineBookStore&am=" + amount + "&tn=" + reference;
    }
}
