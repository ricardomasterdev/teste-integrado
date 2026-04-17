package com.example.backend.repository;

import com.example.backend.domain.AppUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByUsername(String username);

    boolean existsByUsername(String username);

    Page<AppUser> findByUsernameContainingIgnoreCaseOrNomeContainingIgnoreCase(
            String username, String nome, Pageable pageable);
}
