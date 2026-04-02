package com.bookstore.service;

import java.util.List;

import com.bookstore.entity.Order;

public interface OrderService {

    Order createOrder(Long userId, List<Long> bookIds);

    List<Order> getOrdersByUserId(Long userId);

    List<Order> getCompletedOrdersByUserId(Long userId);
}
