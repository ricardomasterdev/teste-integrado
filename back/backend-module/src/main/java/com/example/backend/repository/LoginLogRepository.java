package com.example.backend.repository;

import com.example.backend.domain.LoginLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LoginLogRepository extends JpaRepository<LoginLog, Long> {

    Page<LoginLog> findByUsernameContainingIgnoreCase(String username, Pageable pageable);

    Page<LoginLog> findBySucesso(Boolean sucesso, Pageable pageable);

    Page<LoginLog> findByUsernameContainingIgnoreCaseAndSucesso(
            String username, Boolean sucesso, Pageable pageable);
}
