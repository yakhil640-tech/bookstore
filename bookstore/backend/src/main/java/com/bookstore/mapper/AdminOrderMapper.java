package com.bookstore.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import com.bookstore.dto.admin.AdminOrderResponseDTO;
import com.bookstore.dto.order.OrderItemResponseDTO;
import com.bookstore.entity.Order;

@Component
public class AdminOrderMapper {

    public AdminOrderResponseDTO toAdminOrderResponseDTO(Order order) {
        List<OrderItemResponseDTO> items = order.getOrderItems().stream()
                .map(orderItem -> new OrderItemResponseDTO(
                        orderItem.getBook().getId(),
                        orderItem.getBook().getTitle(),
                        orderItem.getUnitPrice()))
                .toList();

        return new AdminOrderResponseDTO(
                order.getId(),
                order.getPurchaser().getId(),
                order.getPurchaser().getFullName(),
                order.getPurchaser().getEmail(),
                order.getStatus().name(),
                order.getTotalAmount(),
                order.getOrderedAt(),
                items);
    }
}
