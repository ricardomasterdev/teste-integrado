package com.example.backend.service;

import com.example.backend.domain.Beneficio;
import com.example.backend.dto.BeneficioDto;
import com.example.backend.dto.TransferRequest;
import com.example.backend.exception.BusinessException;
import com.example.backend.repository.BeneficioRepository;
import com.example.backend.repository.BeneficioTransferenciaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class BeneficioServiceTest {

    private BeneficioRepository repo;
    private BeneficioTransferenciaRepository transfRepo;
    private BeneficioService service;

    @BeforeEach
    void setup() {
        repo = mock(BeneficioRepository.class);
        transfRepo = mock(BeneficioTransferenciaRepository.class);
        service = new BeneficioService(repo, transfRepo);
    }

    private Beneficio b(Long id, BigDecimal v, boolean ativo) {
        Beneficio x = new Beneficio("B" + id, "d", v);
        x.setId(id); x.setAtivo(ativo); x.setVersion(0L);
        return x;
    }

    @Test
    void transfer_sucesso() {
        when(repo.findByIdForUpdate(1L)).thenReturn(Optional.of(b(1L, new BigDecimal("1000"), true)));
        when(repo.findByIdForUpdate(2L)).thenReturn(Optional.of(b(2L, new BigDecimal("100"),  true)));
        when(repo.save(any())).thenAnswer(i -> i.getArgument(0));

        service.transfer(new TransferRequest(1L, 2L, new BigDecimal("250")));

        verify(repo, times(2)).save(any());
        verify(repo).flush();
        verify(transfRepo).save(any());
    }

    @Test
    void transfer_saldoInsuficiente() {
        when(repo.findByIdForUpdate(1L)).thenReturn(Optional.of(b(1L, new BigDecimal("10"), true)));
        when(repo.findByIdForUpdate(2L)).thenReturn(Optional.of(b(2L, new BigDecimal("0"),  true)));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.transfer(new TransferRequest(1L, 2L, new BigDecimal("50"))));
        assertEquals("INSUFFICIENT_FUNDS", ex.getCode());
    }

    @Test
    void transfer_mesmaConta() {
        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.transfer(new TransferRequest(1L, 1L, new BigDecimal("1"))));
        assertEquals("VALIDATION_ERROR", ex.getCode());
    }

    @Test
    void transfer_valorInvalido() {
        assertThrows(BusinessException.class,
                () -> service.transfer(new TransferRequest(1L, 2L, BigDecimal.ZERO)));
        assertThrows(BusinessException.class,
                () -> service.transfer(new TransferRequest(1L, 2L, new BigDecimal("-1"))));
    }

    @Test
    void transfer_beneficioInativo() {
        when(repo.findByIdForUpdate(1L)).thenReturn(Optional.of(b(1L, new BigDecimal("100"), false)));
        when(repo.findByIdForUpdate(2L)).thenReturn(Optional.of(b(2L, new BigDecimal("0"),  true)));

        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.transfer(new TransferRequest(1L, 2L, new BigDecimal("10"))));
        assertEquals("INACTIVE_ACCOUNT", ex.getCode());
    }

    @Test
    void transfer_origemNaoEncontrada() {
        when(repo.findByIdForUpdate(anyLong())).thenReturn(Optional.empty());
        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.transfer(new TransferRequest(1L, 2L, new BigDecimal("10"))));
        assertEquals("NOT_FOUND", ex.getCode());
    }

    @Test
    void create_valorNegativoRejeita() {
        BeneficioDto dto = new BeneficioDto(null, "X", null, new BigDecimal("-1"), true, null, null, null);
        assertThrows(BusinessException.class, () -> service.create(dto));
    }

    @Test
    void create_sucesso() {
        when(repo.save(any())).thenAnswer(i -> {
            Beneficio e = i.getArgument(0);
            e.setId(10L); return e;
        });
        BeneficioDto dto = new BeneficioDto(null, "Novo", "d", new BigDecimal("500"), true, null, null, null);
        BeneficioDto out = service.create(dto);
        assertEquals(10L, out.id());
        assertEquals("Novo", out.nome());
    }
}
