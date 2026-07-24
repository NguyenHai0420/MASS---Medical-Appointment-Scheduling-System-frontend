package com.group_project.MASS.controller;

import com.group_project.MASS.dto.request.DoctorRequest;
import com.group_project.MASS.dto.response.DoctorProfileResponse;
import com.group_project.MASS.service.DoctorProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/doctors")
public class DoctorProfileController {

    @Autowired
    private DoctorProfileService doctorProfileService;

    @GetMapping
    public ResponseEntity<List<DoctorProfileResponse>> getAllDoctors() {
        return ResponseEntity.ok(doctorProfileService.getAllDoctors());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<DoctorProfileResponse> createDoctor(@Valid @RequestBody DoctorRequest request) {
        return ResponseEntity.ok(doctorProfileService.createDoctor(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<DoctorProfileResponse> updateDoctor(
            @PathVariable Long id,
            @Valid @RequestBody DoctorRequest request) {
        return ResponseEntity.ok(doctorProfileService.updateDoctor(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<?> deleteDoctor(@PathVariable Long id) {
        doctorProfileService.deleteDoctor(id);
        return ResponseEntity.ok().build();
    }
}
