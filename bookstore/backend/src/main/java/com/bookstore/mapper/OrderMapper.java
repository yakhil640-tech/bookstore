package com.bookstore.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import com.bookstore.dto.order.OrderItemResponseDTO;
import com.bookstore.dto.order.OrderResponseDTO;
import com.bookstore.entity.Order;

@Component
public class OrderMapper {

    public OrderResponseDTO toOrderResponseDTO(Order order) {
        List<OrderItemResponseDTO> items = order.getOrderItems().stream()
                .map(orderItem -> new OrderItemResponseDTO(
                        orderItem.getBook().getId(),
                        orderItem.getBook().getTitle(),
                        orderItem.getUnitPrice()))
                .toList();

        return new OrderResponseDTO(
                order.getId(),
                order.getPurchaser().getId(),
                order.getStatus().name(),
                order.getTotalAmount(),
                order.getOrderedAt(),
                items);
    }
}
