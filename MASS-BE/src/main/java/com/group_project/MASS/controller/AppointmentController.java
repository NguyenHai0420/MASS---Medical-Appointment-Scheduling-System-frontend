package com.group_project.MASS.controller;

import com.group_project.MASS.dto.AppointmentDto;
import com.group_project.MASS.dto.request.AppointmentRequestDto;
import com.group_project.MASS.dto.request.RescheduleRequestDto;
import com.group_project.MASS.dto.request.CancelAppointmentRequest;
import com.group_project.MASS.dto.request.CreateWalkInAppointmentRequest;
import com.group_project.MASS.dto.request.UpdateAppointmentRequest;
import com.group_project.MASS.dto.request.UpdateAppointmentStatusRequest;
import com.group_project.MASS.dto.response.*;
import com.group_project.MASS.model.AppointmentStatus;
import com.group_project.MASS.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.time.LocalDate;
import java.time.LocalTime;
import org.springframework.format.annotation.DateTimeFormat;
import com.group_project.MASS.dto.response.AvailableScheduleResponse;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    private String getEmail(Principal principal) {
        if (principal == null) {

            return "patient@test.com";
        }
        return principal.getName();
    }

    @PostMapping
    public ResponseEntity<AppointmentDto> bookAppointment(@RequestBody AppointmentRequestDto request, Principal principal) {
        return ResponseEntity.ok(appointmentService.bookAppointment(request, getEmail(principal)));
    }

    @GetMapping("/available-slots")
    public ResponseEntity<List<AvailableScheduleResponse>> getAvailableSlots(
            @RequestParam(required = false) Long specialtyId,
            @RequestParam(required = false) Long doctorProfileId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime fromTime
    ) {
        return ResponseEntity.ok(appointmentService.getAvailableSchedules(specialtyId, doctorProfileId, date, fromTime));
    }

    @GetMapping("/my-appointments")
    public ResponseEntity<List<AppointmentDto>> getMyAppointments(Principal principal) {
        return ResponseEntity.ok(appointmentService.getPatientAppointments(getEmail(principal)));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<AppointmentDto> cancelAppointment(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(appointmentService.cancelPatientAppointment(id, getEmail(principal)));
    }

    @PutMapping("/{id}/reschedule")
    public ResponseEntity<AppointmentDto> rescheduleAppointment(
            @PathVariable Long id,
            @RequestBody RescheduleRequestDto request,
            Principal principal) {
        return ResponseEntity.ok(appointmentService.rescheduleAppointment(id, request, getEmail(principal)));
    }
}
