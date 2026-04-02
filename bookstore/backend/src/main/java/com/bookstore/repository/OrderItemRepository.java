package com.bookstore.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.bookstore.entity.OrderItem;
import com.bookstore.entity.enums.OrderStatus;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    boolean existsByOrderPurchaserIdAndOrderStatusInAndBookId(Long purchaserId,
            List<OrderStatus> orderStatuses,
            Long bookId);

    default boolean existsByOrderUserIdAndBookId(Long userId, Long bookId) {
        return existsCompletedPurchaseByUserIdAndBookId(userId, bookId);
    }

    default boolean existsCompletedPurchaseByUserIdAndBookId(Long userId, Long bookId) {
        return existsByOrderPurchaserIdAndOrderStatusInAndBookId(userId,
                List.of(OrderStatus.COMPLETED, OrderStatus.PAID),
                bookId);
    }

    default boolean existsPendingOrderByUserIdAndBookId(Long userId, Long bookId) {
        return existsByOrderPurchaserIdAndOrderStatusInAndBookId(userId,
                List.of(OrderStatus.PENDING),
                bookId);
    }
}
