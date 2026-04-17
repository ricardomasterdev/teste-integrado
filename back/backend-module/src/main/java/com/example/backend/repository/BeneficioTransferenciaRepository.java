package com.example.backend.repository;

import com.example.backend.domain.BeneficioTransferencia;
import com.example.backend.dto.BeneficioTransferenciaDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface BeneficioTransferenciaRepository extends JpaRepository<BeneficioTransferencia, Long> {

    Page<BeneficioTransferencia> findAllByOrderByIdDesc(Pageable pageable);

    /**
     * Consulta paginada enriquecida: traz o nome do benefício de origem
     * e destino via LEFT JOIN, evitando N+1 no frontend.
     */
    @Query(
        value = """
            SELECT new com.example.backend.dto.BeneficioTransferenciaDto(
                t.id,
                t.beneficioOrigemId,
                origem.nome,
                t.beneficioDestinoId,
                destino.nome,
                t.valor,
                t.usuario,
                t.status,
                t.mensagem,
                t.createdAt
            )
            FROM BeneficioTransferencia t
            LEFT JOIN com.example.backend.domain.Beneficio origem  ON origem.id  = t.beneficioOrigemId
            LEFT JOIN com.example.backend.domain.Beneficio destino ON destino.id = t.beneficioDestinoId
            """,
        countQuery = "SELECT COUNT(t) FROM BeneficioTransferencia t"
    )
    Page<BeneficioTransferenciaDto> findPageWithNames(Pageable pageable);
}
