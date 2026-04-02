package com.bookstore.mapper;

import java.util.List;

import org.springframework.stereotype.Component;

import com.bookstore.dto.user.UserResponseDTO;
import com.bookstore.entity.User;

@Component
public class UserMapper {

    public UserResponseDTO toUserResponseDTO(User user) {
        List<String> roles = user.getRoles().stream()
                .map(role -> role.getName())
                .toList();

        return new UserResponseDTO(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getStatus().name(),
                user.getEnabled(),
                roles);
    }
}
