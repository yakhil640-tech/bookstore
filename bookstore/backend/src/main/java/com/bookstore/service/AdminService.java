package com.bookstore.service;

import java.util.List;

import com.bookstore.dto.admin.AdminAnalyticsResponseDTO;
import com.bookstore.dto.admin.AdminOrderResponseDTO;
import com.bookstore.dto.admin.AdminPaymentResponseDTO;
import com.bookstore.dto.user.UserResponseDTO;

public interface AdminService {

    AdminAnalyticsResponseDTO getAnalytics();

    List<UserResponseDTO> getUsers();

    List<AdminOrderResponseDTO> getOrders();

    List<AdminPaymentResponseDTO> getPayments();
}
