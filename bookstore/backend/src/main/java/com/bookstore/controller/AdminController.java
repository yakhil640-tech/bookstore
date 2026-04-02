package com.bookstore.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.dto.admin.AdminAnalyticsResponseDTO;
import com.bookstore.dto.admin.AdminOrderResponseDTO;
import com.bookstore.dto.admin.AdminPaymentResponseDTO;
import com.bookstore.dto.user.UserResponseDTO;
import com.bookstore.response.ApiResponse;
import com.bookstore.service.AdminService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<AdminAnalyticsResponseDTO>> getAnalytics() {
        return ResponseEntity.ok(ApiResponse.success("Analytics fetched successfully", adminService.getAnalytics()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponseDTO>>> getUsers() {
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", adminService.getUsers()));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<AdminOrderResponseDTO>>> getOrders() {
        return ResponseEntity.ok(ApiResponse.success("Orders fetched successfully", adminService.getOrders()));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<List<AdminPaymentResponseDTO>>> getPayments() {
        return ResponseEntity.ok(ApiResponse.success("Payments fetched successfully", adminService.getPayments()));
    }
}
