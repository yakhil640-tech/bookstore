package com.bookstore.scheduler;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import com.bookstore.entity.UserSubscription;
import com.bookstore.entity.enums.SubscriptionStatus;
import com.bookstore.repository.RoleRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.repository.UserSubscriptionRepository;

@Component
public class SubscriptionExpiryScheduler {

    private static final Logger logger = LoggerFactory.getLogger(SubscriptionExpiryScheduler.class);
    private static final String ROLE_USER = "ROLE_USER";
    private static final String ROLE_SUBSCRIBER = "ROLE_SUBSCRIBER";

    private final UserSubscriptionRepository userSubscriptionRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public SubscriptionExpiryScheduler(UserSubscriptionRepository userSubscriptionRepository,
            UserRepository userRepository,
            RoleRepository roleRepository) {
        this.userSubscriptionRepository = userSubscriptionRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void expireSubscriptions() {
        LocalDate today = LocalDate.now();
        List<UserSubscription> expiredSubscriptions = userSubscriptionRepository
                .findByStatusAndEndDateBefore(SubscriptionStatus.ACTIVE, today);

        if (expiredSubscriptions.isEmpty()) {
            logger.debug("No subscriptions to expire at this time");
            return;
        }

        logger.info("Expiring {} subscriptions", expiredSubscriptions.size());

        Set<Long> affectedUserIds = expiredSubscriptions.stream()
                .map(subscription -> subscription.getUser().getId())
                .collect(Collectors.toSet());

        for (UserSubscription subscription : expiredSubscriptions) {
            subscription.setStatus(SubscriptionStatus.EXPIRED);
        }
        userSubscriptionRepository.saveAll(expiredSubscriptions);

        Role userRole = getOrCreateRole(ROLE_USER);

        for (Long userId : affectedUserIds) {
            List<UserSubscription> activeSubscriptions = userSubscriptionRepository.findByUserIdAndStatus(userId,
                    SubscriptionStatus.ACTIVE);

            if (activeSubscriptions.isEmpty()) {
                userRepository.findById(userId).ifPresent(user -> downgradeToUserRole(user, userRole));
            }
        }
    }

    private void downgradeToUserRole(User user, Role userRole) {
        boolean removedSubscriberRole = user.getRoles().removeIf(role -> ROLE_SUBSCRIBER.equals(role.getName()));
        user.getRoles().add(userRole);

        if (removedSubscriberRole) {
            logger.info("Downgraded user {} to ROLE_USER after subscription expiry", user.getEmail());
        }

        userRepository.save(user);
    }

    private Role getOrCreateRole(String roleName) {
        return roleRepository.findByName(roleName)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(roleName);
                    return roleRepository.save(role);
                });
    }
}
