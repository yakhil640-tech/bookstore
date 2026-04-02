package com.bookstore.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bookstore.dto.auth.AuthResponse;
import com.bookstore.dto.auth.LoginRequestDTO;
import com.bookstore.dto.auth.RegisterRequestDTO;
import com.bookstore.dto.user.UserResponseDTO;
import com.bookstore.exception.UnauthorizedException;
import com.bookstore.response.ApiResponse;
import com.bookstore.security.CustomUserDetails;
import com.bookstore.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequestDTO request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequestDTO request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponseDTO>> getCurrentUser(
            @AuthenticationPrincipal CustomUserDetails currentUser) {
        if (currentUser == null) {
            throw new UnauthorizedException("Authentication is required");
        }

        UserResponseDTO user = authService.getCurrentUser(currentUser.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Current user fetched successfully", user));
    }
}
