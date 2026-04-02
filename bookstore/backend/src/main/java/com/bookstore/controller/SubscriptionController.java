package com.bookstore.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.dto.subscription.SubscriptionResponseDTO;
import com.bookstore.entity.UserSubscription;
import com.bookstore.exception.UnauthorizedException;
import com.bookstore.mapper.SubscriptionMapper;
import com.bookstore.response.ApiResponse;
import com.bookstore.security.CustomUserDetails;
import com.bookstore.service.SubscriptionService;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final SubscriptionMapper subscriptionMapper;

    public SubscriptionController(SubscriptionService subscriptionService, SubscriptionMapper subscriptionMapper) {
        this.subscriptionService = subscriptionService;
        this.subscriptionMapper = subscriptionMapper;
    }

    @PostMapping("/start")
    public ResponseEntity<ApiResponse<SubscriptionResponseDTO>> startSubscription(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        if (currentUser == null) {
            throw new UnauthorizedException("Authentication is required to start a subscription");
        }

        UserSubscription subscription = subscriptionService.startSubscription(currentUser.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Subscription started successfully",
                        subscriptionMapper.toSubscriptionResponseDTO(subscription)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<SubscriptionResponseDTO>>> getMySubscriptions(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        if (currentUser == null) {
            throw new UnauthorizedException("Authentication is required to view subscriptions");
        }

        List<SubscriptionResponseDTO> subscriptions = subscriptionService.getSubscriptionsByUserId(currentUser.getUserId())
                .stream()
                .map(subscriptionMapper::toSubscriptionResponseDTO)
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Subscriptions fetched successfully", subscriptions));
    }
}
