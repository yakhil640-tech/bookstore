package com.bookstore.service.impl;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Sort;

import com.bookstore.dto.admin.AdminAnalyticsResponseDTO;
import com.bookstore.dto.admin.AdminOrderResponseDTO;
import com.bookstore.dto.admin.AdminPaymentResponseDTO;
import com.bookstore.dto.user.UserResponseDTO;
import com.bookstore.entity.enums.OrderStatus;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.OrderRepository;
import com.bookstore.repository.PaymentRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.repository.UserSubscriptionRepository;
import com.bookstore.mapper.AdminOrderMapper;
import com.bookstore.mapper.AdminPaymentMapper;
import com.bookstore.mapper.UserMapper;
import com.bookstore.service.AdminService;

@Service
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {
    private static final List<OrderStatus> REVENUE_STATUSES = List.of(OrderStatus.COMPLETED, OrderStatus.PAID);

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;
    private final UserMapper userMapper;
    private final AdminOrderMapper adminOrderMapper;
    private final AdminPaymentMapper adminPaymentMapper;

    public AdminServiceImpl(UserRepository userRepository,
            BookRepository bookRepository,
            OrderRepository orderRepository,
            PaymentRepository paymentRepository,
            UserSubscriptionRepository userSubscriptionRepository,
            UserMapper userMapper,
            AdminOrderMapper adminOrderMapper,
            AdminPaymentMapper adminPaymentMapper) {
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
        this.userSubscriptionRepository = userSubscriptionRepository;
        this.userMapper = userMapper;
        this.adminOrderMapper = adminOrderMapper;
        this.adminPaymentMapper = adminPaymentMapper;
    }

    @Override
    public AdminAnalyticsResponseDTO getAnalytics() {
        BigDecimal totalRevenue = orderRepository.sumTotalAmountByStatusIn(REVENUE_STATUSES);
        long completedOrders = orderRepository.countByStatusIn(REVENUE_STATUSES);

        return new AdminAnalyticsResponseDTO(
                userRepository.count(),
                bookRepository.count(),
                completedOrders,
                totalRevenue,
                userSubscriptionRepository.count());
    }

    @Override
    public List<UserResponseDTO> getUsers() {
        return userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(userMapper::toUserResponseDTO)
                .toList();
    }

    @Override
    public List<AdminOrderResponseDTO> getOrders() {
        return orderRepository.findAll(Sort.by(Sort.Direction.DESC, "orderedAt"))
                .stream()
                .map(adminOrderMapper::toAdminOrderResponseDTO)
                .toList();
    }

    @Override
    public List<AdminPaymentResponseDTO> getPayments() {
        return paymentRepository.findAll(Sort.by(
                Sort.Order.desc("verifiedAt"),
                Sort.Order.desc("createdAt")))
                .stream()
                .map(adminPaymentMapper::toAdminPaymentResponseDTO)
                .toList();
    }
}
