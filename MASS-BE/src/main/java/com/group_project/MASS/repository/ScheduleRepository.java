package com.group_project.MASS.repository;

import com.group_project.MASS.model.DoctorProfile;
import com.group_project.MASS.model.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByDoctorProfileOrderByDateAscStartTimeAsc(DoctorProfile doctorProfile);

    List<Schedule> findByDoctorProfileIdAndDate(Long doctorProfileId, LocalDate date);
    List<Schedule> findByDoctorProfileIdAndDateAndIsAvailable(Long doctorProfileId, LocalDate date, boolean isAvailable);

    List<Schedule> findByDoctorProfileIdAndDateOrderByStartTimeAsc(
            Long doctorProfileId,
            LocalDate date
    );

    List<Schedule> findByDoctorProfileSpecialtyIdAndDateAndStartTimeGreaterThanEqualAndIsAvailableTrueOrderByStartTimeAsc(
            Long specialtyId,
            LocalDate date,
            LocalTime startTime
    );

    List<Schedule> findByDoctorProfileIdAndDateAndStartTimeGreaterThanEqualAndIsAvailableTrueOrderByStartTimeAsc(
            Long doctorProfileId,
            LocalDate date,
            LocalTime startTime
    );

    List<Schedule> findByDoctorProfileSpecialtyIdAndDateAndIsAvailableTrueOrderByStartTimeAsc(
            Long specialtyId,
            LocalDate date
    );

    List<Schedule> findByDoctorProfileIdAndDateAndIsAvailableTrueOrderByStartTimeAsc(
            Long doctorProfileId,
            LocalDate date
    );

    boolean existsByDoctorProfileIdAndDateAndStartTime(
            Long doctorProfileId,
            LocalDate date,
            LocalTime startTime
    );

    Optional<Schedule> findByDoctorProfileIdAndDateAndStartTime(
            Long doctorProfileId,
            LocalDate date,
            LocalTime startTime
    );

    Optional<Schedule> findByIdAndIsAvailableTrue(Long id);

}
