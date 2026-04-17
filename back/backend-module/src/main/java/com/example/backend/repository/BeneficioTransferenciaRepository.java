package com.example.backend.repository;

import com.example.backend.domain.BeneficioTransferencia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BeneficioTransferenciaRepository extends JpaRepository<BeneficioTransferencia, Long> {
    Page<BeneficioTransferencia> findAllByOrderByIdDesc(Pageable pageable);
}
