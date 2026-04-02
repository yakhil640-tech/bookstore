package com.bookstore.dto.auth;

import com.bookstore.dto.user.UserResponseDTO;


public class AuthResponse {

    private String message;
    private String token;
    private String tokenType;
    private UserResponseDTO user;


    public AuthResponse() {
    }

    public AuthResponse(String message, String token, String tokenType, UserResponseDTO user) {
        this.message = message;
        this.token = token;
        this.tokenType = tokenType;
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public UserResponseDTO getUser() {
        return user;
    }

    public void setUser(UserResponseDTO user) {
        this.user = user;
    }
}

