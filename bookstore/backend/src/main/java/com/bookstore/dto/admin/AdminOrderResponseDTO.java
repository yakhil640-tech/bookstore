package com.bookstore.dto.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.bookstore.dto.order.OrderItemResponseDTO;

public class AdminOrderResponseDTO {

    private Long orderId;
    private Long userId;
    private String userName;
    private String userEmail;
    private String status;
    private BigDecimal totalAmount;
    private LocalDateTime orderedAt;
    private List<OrderItemResponseDTO> items;

    public AdminOrderResponseDTO() {
    }

    public AdminOrderResponseDTO(Long orderId, Long userId, String userName, String userEmail, String status,
            BigDecimal totalAmount, LocalDateTime orderedAt, List<OrderItemResponseDTO> items) {
        this.orderId = orderId;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.status = status;
        this.totalAmount = totalAmount;
        this.orderedAt = orderedAt;
        this.items = items;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public LocalDateTime getOrderedAt() {
        return orderedAt;
    }

    public void setOrderedAt(LocalDateTime orderedAt) {
        this.orderedAt = orderedAt;
    }

    public List<OrderItemResponseDTO> getItems() {
        return items;
    }

    public void setItems(List<OrderItemResponseDTO> items) {
        this.items = items;
    }
}
