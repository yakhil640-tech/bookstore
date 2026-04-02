package com.bookstore.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.dto.order.OrderResponseDTO;
import com.bookstore.entity.Order;
import com.bookstore.exception.UnauthorizedException;
import com.bookstore.mapper.OrderMapper;
import com.bookstore.response.ApiResponse;
import com.bookstore.security.CustomUserDetails;
import com.bookstore.service.OrderService;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;
    private final OrderMapper orderMapper;

    public OrderController(OrderService orderService, OrderMapper orderMapper) {
        this.orderService = orderService;
        this.orderMapper = orderMapper;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponseDTO>> createOrder(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestBody Map<String, List<Long>> requestBody) {

        if (currentUser == null) {
            throw new UnauthorizedException("Authentication is required to create an order");
        }

        List<Long> bookIds = requestBody.get("bookIds");
        Order order = orderService.createOrder(currentUser.getUserId(), bookIds);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order created successfully", orderMapper.toOrderResponseDTO(order)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<OrderResponseDTO>>> getMyLibraryOrders(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        if (currentUser == null) {
            throw new UnauthorizedException("Authentication is required to view your library");
        }

        List<OrderResponseDTO> orders = orderService.getCompletedOrdersByUserId(currentUser.getUserId())
                .stream()
                .map(orderMapper::toOrderResponseDTO)
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Library fetched successfully", orders));
    }
}
