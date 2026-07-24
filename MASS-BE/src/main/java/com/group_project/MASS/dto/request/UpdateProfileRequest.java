package com.group_project.MASS.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateProfileRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phone;
    private String avatarUrl;
    private String gender;
    private LocalDate dateOfBirth;
    private String address;
}
