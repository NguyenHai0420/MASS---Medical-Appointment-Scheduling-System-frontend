package com.group_project.MASS.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorProfileResponse {
    private Long id;               // DoctorProfile id
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String gender;
    private String avatarUrl;

    private Long specialtyId;
    private String specialtyName;
    private String degree;
    private String experience;
    private String description;
    private Boolean active;
}
