package com.bookstore.service.impl;

import java.util.HashSet;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.bookstore.dto.auth.AuthResponse;
import com.bookstore.dto.auth.LoginRequestDTO;
import com.bookstore.dto.auth.RegisterRequestDTO;
import com.bookstore.dto.user.UserResponseDTO;
import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import com.bookstore.entity.enums.UserStatus;
import com.bookstore.exception.BadRequestException;
import com.bookstore.exception.ResourceNotFoundException;
import com.bookstore.mapper.UserMapper;
import com.bookstore.repository.RoleRepository;
import com.bookstore.repository.UserRepository;
import com.bookstore.security.CustomUserDetails;
import com.bookstore.security.JwtUtil;
import com.bookstore.service.AuthService;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);
    private static final String DEFAULT_USER_ROLE = "ROLE_USER";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;

    public AuthServiceImpl(UserRepository userRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtUtil jwtUtil,
            UserMapper userMapper) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userMapper = userMapper;
    }

    @Override
    public AuthResponse register(RegisterRequestDTO request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        String normalizedFullName = normalizeText(request.getFullName());
        String normalizedPhoneNumber = normalizeOptionalText(request.getPhoneNumber());

        logger.info("Registering user with email: {}", normalizedEmail);

        if (userRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            throw new BadRequestException("Email is already registered");
        }

        Role userRole = roleRepository.findByName(DEFAULT_USER_ROLE)
                .orElseGet(this::createDefaultUserRole);

        User user = new User();
        user.setFullName(normalizedFullName);
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(normalizedPhoneNumber);
        user.setEnabled(true);
        user.setStatus(UserStatus.ACTIVE);
        user.setRoles(new HashSet<>(List.of(userRole)));

        User savedUser = userRepository.save(user);
        CustomUserDetails userDetails = CustomUserDetails.fromUser(savedUser);
        String token = jwtUtil.generateToken(userDetails);

        return buildAuthResponse("User registered successfully", token, savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequestDTO request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        String submittedPassword = request.getPassword() == null ? "" : request.getPassword();
        String trimmedPassword = submittedPassword.trim();

        logger.info("Login attempt for email: {}", normalizedEmail);

        authenticateUser(normalizedEmail, submittedPassword, trimmedPassword);

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("User not found with email: " + normalizedEmail));

        CustomUserDetails userDetails = CustomUserDetails.fromUser(user);
        String token = jwtUtil.generateToken(userDetails);
        logger.info("Login successful for email: {} with roles {}", normalizedEmail,
                user.getRoles().stream().map(Role::getName).toList());

        return buildAuthResponse("Login successful", token, user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return userMapper.toUserResponseDTO(user);
    }

    private Role createDefaultUserRole() {
        Role role = new Role();
        role.setName(DEFAULT_USER_ROLE);
        return roleRepository.save(role);
    }

    private void authenticateUser(String normalizedEmail, String submittedPassword, String trimmedPassword) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, submittedPassword));
        } catch (AuthenticationException primaryException) {
            if (!trimmedPassword.equals(submittedPassword)) {
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(normalizedEmail, trimmedPassword));
                return;
            }

            throw primaryException;
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private String normalizeText(String value) {
        return value == null ? "" : value.trim();
    }

    private String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private AuthResponse buildAuthResponse(String message, String token, User user) {
        UserResponseDTO userResponseDTO = userMapper.toUserResponseDTO(user);
        return new AuthResponse(message, token, "Bearer", userResponseDTO);
    }
}
