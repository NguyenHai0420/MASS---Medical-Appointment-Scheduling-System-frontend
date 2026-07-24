package com.group_project.MASS.service.impl;

import com.group_project.MASS.service.AuthService;
import com.group_project.MASS.service.EmailService;
import com.group_project.MASS.dto.response.AuthResponse;
import com.group_project.MASS.dto.request.LoginRequest;
import com.group_project.MASS.dto.request.RegisterRequest;
import com.group_project.MASS.model.PasswordResetToken;
import com.group_project.MASS.model.Role;
import com.group_project.MASS.model.User;
import com.group_project.MASS.repository.PasswordResetTokenRepository;
import com.group_project.MASS.repository.UserRepository;
import com.group_project.MASS.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private EmailService emailService;

    public String login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        return jwtUtils.generateJwtToken(authentication);
    }

    @Transactional
    public void register(RegisterRequest registerRequest) {
        Optional<User> existingUserOpt = userRepository.findByEmail(registerRequest.getEmail());
        if (existingUserOpt.isPresent()) {
            User existingUser = existingUserOpt.get();
            if (existingUser.getIsVerified() != null && existingUser.getIsVerified()) {
                throw new RuntimeException("Error: Email is already in use and verified!");
            }

            existingUser.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
            existingUser.setFullName(registerRequest.getFullName());
            userRepository.save(existingUser);
            generateAndSendOtp(registerRequest.getEmail());
            return;
        }

        User user = User.builder()
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .fullName(registerRequest.getFullName())
                .role(Role.ROLE_PATIENT)
                .isVerified(false)
                .build();

        userRepository.save(user);
        generateAndSendOtp(registerRequest.getEmail());
    }

    @Transactional
    public void verifyRegistrationOtp(String email, String otp) {
        verifyOtp(email, otp);
        User user = userRepository.findByEmail(email).get();
        user.setIsVerified(true);
        userRepository.save(user);
        tokenRepository.deleteByUser(user);
    }

    public AuthResponse getMe(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return AuthResponse.builder()
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .build();
    }

    @Transactional
    public void generateAndSendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        tokenRepository.deleteByUser(user);

        String otp = String.format("%06d", new Random().nextInt(999999));

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(otp)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(15))
                .build();

        tokenRepository.save(resetToken);
        emailService.sendOtpEmail(email, otp);
    }

    public void verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PasswordResetToken resetToken = tokenRepository.findByToken(otp)
                .orElseThrow(() -> new RuntimeException("Invalid OTP"));

        if (!resetToken.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Invalid OTP for this user");
        }

        if (resetToken.isExpired()) {
            throw new RuntimeException("OTP is expired");
        }
    }

    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        verifyOtp(email, otp);

        User user = userRepository.findByEmail(email).get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        tokenRepository.deleteByUser(user);
    }
}
