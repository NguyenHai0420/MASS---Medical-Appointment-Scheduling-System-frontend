package com.group_project.MASS.repository;

import com.group_project.MASS.model.DoctorProfile;
import com.group_project.MASS.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, Long> {
    Optional<DoctorProfile> findByUser(User user);
    Optional<DoctorProfile> findByUserEmail(String email);

    List<DoctorProfile> findBySpecialtyId(Long specialtyId);

    Optional<DoctorProfile> findUserById(Long userId);

    @Query("SELECT d FROM DoctorProfile d WHERE d.user.fullName LIKE %:name%")
    List<DoctorProfile> findByUserFullNameContainingIgnoreCase(@Param("name") String name);

    @Query("SELECT d FROM DoctorProfile d WHERE d.specialty.id = :specialtyId AND d.user.fullName LIKE %:name%")
    List<DoctorProfile> findBySpecialtyIdAndUserFullNameContainingIgnoreCase(@Param("specialtyId") Long specialtyId, @Param("name") String name);
}
