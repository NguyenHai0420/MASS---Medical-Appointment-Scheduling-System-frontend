package com.group_project.MASS.repository;

import com.group_project.MASS.model.Appointment;
import com.group_project.MASS.model.AppointmentStatus;
import com.group_project.MASS.model.AppointmentType;
import com.group_project.MASS.model.DoctorProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Page<Appointment> findByScheduleDate(LocalDate date, Pageable page);

    Page<Appointment> findByScheduleDateAndStatus(LocalDate date, AppointmentStatus status, Pageable page);

    List<Appointment> findByDoctorProfileOrderByCreatedAtDesc(DoctorProfile doctorProfile);

    List<Appointment> findByPatientIdOrderByCreatedAtDesc(Long patientId);

    long countByStatus(AppointmentStatus status);

    long countByDoctorProfile(DoctorProfile doctorProfile);

    long countByDoctorProfileAndStatus(DoctorProfile doctorProfile, AppointmentStatus status);

    @Query("SELECT COUNT(DISTINCT a.patient.id) FROM Appointment a")
    long countDistinctPatients();

    List<Appointment> findByScheduleDateOrderByScheduleStartTimeAsc(LocalDate date);

    List<Appointment> findByScheduleDateAndStatusOrderByScheduleStartTimeAsc(LocalDate date, AppointmentStatus status);

    Page<Appointment> findByDoctorProfileSpecialtyIdAndScheduleDate(Long specialtyId, LocalDate date, Pageable page);

    // Find all appointments for a specific doctor profile, date, and status
    Page<Appointment> findByDoctorProfileSpecialtyIdAndScheduleDateAndStatus(
            Long specialtyId,
            LocalDate date,
            AppointmentStatus status,
            Pageable page
    );

    Page<Appointment> findByStatus(AppointmentStatus status, Pageable pageable);

    Page<Appointment> findByDoctorProfileSpecialtyId(
            Long specialtyId,
            Pageable pageable
    );

    Page<Appointment> findByDoctorProfileSpecialtyIdAndStatus(Long specialtyId, AppointmentStatus status, Pageable pageable
    );

    Page<Appointment> findByDoctorProfileIdAndScheduleDate(Long doctorProfileId, LocalDate date, Pageable page);

    List<Appointment> findByScheduleDateAndType(LocalDate date, AppointmentType type);

    boolean existsByScheduleIdAndStatusNot(Long scheduleId, AppointmentStatus status);

    boolean existsByDoctorProfileIdAndScheduleDateAndScheduleStartTimeAndStatusNot(
            Long doctorProfileId, LocalDate date, LocalTime startTime, AppointmentStatus status
    );
}
