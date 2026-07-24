package com.group_project.MASS.repository;

import com.group_project.MASS.model.Specialty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository

public interface SpecialtyRepository extends JpaRepository<Specialty, Long> {
    boolean existsByName(String name);

    List<Specialty> findAllByOrderByNameAsc();

    Optional<Specialty> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

}
