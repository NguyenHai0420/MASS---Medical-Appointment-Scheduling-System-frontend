package com.group_project.MASS.service.impl;

import com.group_project.MASS.dto.response.UserResponse;
import com.group_project.MASS.dto.request.UserUpdateRequest;
import com.group_project.MASS.model.Role;
import com.group_project.MASS.model.User;
import com.group_project.MASS.repository.UserRepository;
import com.group_project.MASS.service.UserAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserAdminServiceImpl implements UserAdminService {

    @Autowired
    private UserRepository userRepository;

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .gender(user.getGender())
                .avatarUrl(user.getAvatarUrl())
                .address(user.getAddress())
                .role(user.getRole().name())
                .active(user.getActive())
                .build();
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với id: " + id));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        if (request.getRole() != null) {
            Role newRole = Role.valueOf(request.getRole());
            if (newRole == Role.ROLE_ADMIN && user.getRole() != Role.ROLE_ADMIN) {
                throw new RuntimeException("Không thể gán quyền Admin. Hệ thống chỉ duy trì 1 tài khoản Admin.");
            }
            if (user.getRole() == Role.ROLE_ADMIN && newRole != Role.ROLE_ADMIN) {
                throw new RuntimeException("Không thể thay đổi quyền của tài khoản Admin.");
            }
            user.setRole(newRole);
        }
        if (request.getActive() != null) {
            if (user.getRole() == Role.ROLE_ADMIN && !request.getActive()) {
                throw new RuntimeException("Không thể khóa tài khoản Admin.");
            }
            user.setActive(request.getActive());
        }

        return toResponse(userRepository.save(user));
    }

    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với id: " + id));
        if (user.getRole() == Role.ROLE_ADMIN) {
            throw new RuntimeException("Không thể khóa tài khoản Admin.");
        }
        user.setActive(false);
        userRepository.save(user);
    }
}
