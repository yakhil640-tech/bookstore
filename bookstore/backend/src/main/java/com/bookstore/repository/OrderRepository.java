package com.bookstore.repository;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.bookstore.entity.Order;
import com.bookstore.entity.enums.OrderStatus;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByPurchaserId(Long purchaserId);

    List<Order> findByPurchaserIdAndStatusOrderByOrderedAtDesc(Long purchaserId, OrderStatus status);

    @Query("""
            select distinct o
            from Order o
            left join fetch o.purchaser
            left join fetch o.orderItems oi
            left join fetch oi.book
            where o.purchaser.id = :purchaserId and o.status = :status
            order by o.orderedAt desc
            """)
    List<Order> findCompletedOrdersWithItemsByPurchaserId(
            @Param("purchaserId") Long purchaserId,
            @Param("status") OrderStatus status);

    long countByStatusIn(Collection<OrderStatus> statuses);

    @Query("select coalesce(sum(o.totalAmount), 0) from Order o where o.status in :statuses")
    BigDecimal sumTotalAmountByStatusIn(@Param("statuses") Collection<OrderStatus> statuses);

    default List<Order> findByUserId(Long userId) {
        return findByPurchaserId(userId);
    }
}
