package com.bookstore.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.dto.payment.PaymentResponseDTO;
import com.bookstore.entity.Payment;
import com.bookstore.exception.UnauthorizedException;
import com.bookstore.mapper.PaymentMapper;
import com.bookstore.response.ApiResponse;
import com.bookstore.security.CustomUserDetails;
import com.bookstore.service.PaymentService;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentMapper paymentMapper;

    public PaymentController(PaymentService paymentService, PaymentMapper paymentMapper) {
        this.paymentService = paymentService;
        this.paymentMapper = paymentMapper;
    }

    @PostMapping("/orders/{orderId}/generate")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> generatePayment(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long orderId) {
        if (currentUser == null) {
            throw new UnauthorizedException("Authentication is required to generate payment");
        }

        Payment payment = paymentService.generateOrderPayment(currentUser.getUserId(), orderId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment generated successfully",
                        paymentMapper.toPaymentResponseDTO(payment)));
    }

    @PostMapping("/subscriptions/{subscriptionId}/generate")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> generateSubscriptionPayment(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long subscriptionId) {
        if (currentUser == null) {
            throw new UnauthorizedException("Authentication is required to generate subscription payment");
        }

        Payment payment = paymentService.generateSubscriptionPayment(currentUser.getUserId(), subscriptionId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Subscription payment generated successfully",
                        paymentMapper.toPaymentResponseDTO(payment)));
    }

    @PostMapping("/{paymentId}/verify")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> verifyPayment(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @PathVariable Long paymentId,
            @RequestBody(required = false) Map<String, String> requestBody) {
        if (currentUser == null) {
            throw new UnauthorizedException("Authentication is required to verify payment");
        }

        String utr = requestBody != null ? requestBody.get("utr") : null;
        Payment payment = paymentService.verifyPayment(currentUser.getUserId(), paymentId, utr);
        return ResponseEntity.ok(ApiResponse.success("Payment verified successfully",
                paymentMapper.toPaymentResponseDTO(payment)));
    }
}
