package com.bookstore.service;

import java.util.Optional;

import com.bookstore.entity.User;

public interface UserService {

    Optional<User> getUserById(Long userId);

    Optional<User> getUserByEmail(String email);
}
