package com.bookstore.service;

import com.bookstore.dto.auth.AuthResponse;
import com.bookstore.dto.auth.LoginRequestDTO;
import com.bookstore.dto.auth.RegisterRequestDTO;
import com.bookstore.dto.user.UserResponseDTO;

public interface AuthService {

    AuthResponse register(RegisterRequestDTO request);

    AuthResponse login(LoginRequestDTO request);

    UserResponseDTO getCurrentUser(Long userId);
}
