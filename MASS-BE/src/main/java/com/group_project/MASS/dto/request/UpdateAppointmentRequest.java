package com.group_project.MASS.dto.request;

import com.group_project.MASS.model.AppointmentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAppointmentRequest {
    private Long scheduleId;

    @Size(max = 1000, message = "Lý do khám không được vượt quá 1000 ký tự")
    private String reason;

}
