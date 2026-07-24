package com.group_project.MASS.controller;

import com.group_project.MASS.dto.request.ScheduleRequest;
import com.group_project.MASS.dto.response.ScheduleResponse;
import com.group_project.MASS.service.ScheduleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctor/schedules")
@PreAuthorize("hasAuthority('ROLE_DOCTOR')")
public class DoctorScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    @GetMapping
    public ResponseEntity<List<ScheduleResponse>> getMySchedules(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(scheduleService.getMySchedules(email));
    }

    @PostMapping
    public ResponseEntity<ScheduleResponse> createSchedule(
            @Valid @RequestBody ScheduleRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(scheduleService.createSchedule(email, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSchedule(
            @PathVariable Long id,
            Authentication authentication) {
        String email = authentication.getName();
        scheduleService.deleteSchedule(id, email);
        return ResponseEntity.ok().build();
    }
}
