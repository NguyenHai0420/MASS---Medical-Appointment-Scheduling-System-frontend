package com.group_project.MASS.repository;

import com.group_project.MASS.model.Role;
import com.group_project.MASS.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByRole(Role role);

    List<User> findByRoleOrderByFullNameAsc(Role role);

    List<User> findByRoleAndFullNameContainingIgnoreCase(Role role, String fullName);

    Optional<User> findByPhone(String phone);
}
