package com.example.ejb;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Testes unitários do BeneficioEjbService validando a correção do bug.
 */
class BeneficioEjbServiceTest {

    private EntityManager em;
    private BeneficioEjbService service;

    @BeforeEach
    void setup() throws Exception {
        em = mock(EntityManager.class);
        service = new BeneficioEjbService();
        var f = BeneficioEjbService.class.getDeclaredField("em");
        f.setAccessible(true);
        f.set(service, em);
    }

    private Beneficio mockBeneficio(Long id, BigDecimal valor, boolean ativo) {
        Beneficio b = new Beneficio();
        b.setId(id);
        b.setNome("B" + id);
        b.setValor(valor);
        b.setAtivo(ativo);
        return b;
    }

    @Test
    void transfer_deveDebitarECreditarComSucesso() {
        Beneficio origem  = mockBeneficio(1L, new BigDecimal("1000.00"), true);
        Beneficio destino = mockBeneficio(2L, new BigDecimal("200.00"), true);

        when(em.find(eq(Beneficio.class), eq(1L), eq(LockModeType.PESSIMISTIC_WRITE))).thenReturn(origem);
        when(em.find(eq(Beneficio.class), eq(2L), eq(LockModeType.PESSIMISTIC_WRITE))).thenReturn(destino);

        service.transfer(1L, 2L, new BigDecimal("300.00"));

        assertEquals(new BigDecimal("700.00"), origem.getValor());
        assertEquals(new BigDecimal("500.00"), destino.getValor());
        verify(em).flush();
    }

    @Test
    void transfer_deveFalharComSaldoInsuficiente() {
        Beneficio origem  = mockBeneficio(1L, new BigDecimal("50.00"), true);
        Beneficio destino = mockBeneficio(2L, new BigDecimal("0.00"), true);
        when(em.find(eq(Beneficio.class), eq(1L), any(LockModeType.class))).thenReturn(origem);
        when(em.find(eq(Beneficio.class), eq(2L), any(LockModeType.class))).thenReturn(destino);

        TransferenciaException ex = assertThrows(TransferenciaException.class,
                () -> service.transfer(1L, 2L, new BigDecimal("100.00")));
        assertEquals(TransferenciaException.Motivo.SALDO_INSUFICIENTE, ex.getMotivo());
        verify(em, never()).flush();
    }

    @Test
    void transfer_deveFalharComValorZeroOuNegativo() {
        TransferenciaException e1 = assertThrows(TransferenciaException.class,
                () -> service.transfer(1L, 2L, BigDecimal.ZERO));
        TransferenciaException e2 = assertThrows(TransferenciaException.class,
                () -> service.transfer(1L, 2L, new BigDecimal("-5")));
        assertEquals(TransferenciaException.Motivo.VALOR_INVALIDO, e1.getMotivo());
        assertEquals(TransferenciaException.Motivo.VALOR_INVALIDO, e2.getMotivo());
    }

    @Test
    void transfer_deveFalharMesmaConta() {
        TransferenciaException ex = assertThrows(TransferenciaException.class,
                () -> service.transfer(1L, 1L, new BigDecimal("10")));
        assertEquals(TransferenciaException.Motivo.MESMA_CONTA, ex.getMotivo());
    }

    @Test
    void transfer_deveFalharQuandoOrigemNaoExiste() {
        when(em.find(eq(Beneficio.class), anyLong(), any(LockModeType.class))).thenReturn(null);
        TransferenciaException ex = assertThrows(TransferenciaException.class,
                () -> service.transfer(1L, 2L, new BigDecimal("10")));
        assertEquals(TransferenciaException.Motivo.ORIGEM_NAO_ENCONTRADA, ex.getMotivo());
    }

    @Test
    void transfer_deveFalharSeBeneficioInativo() {
        Beneficio origem  = mockBeneficio(1L, new BigDecimal("1000.00"), false);
        Beneficio destino = mockBeneficio(2L, new BigDecimal("100.00"), true);
        when(em.find(eq(Beneficio.class), eq(1L), any(LockModeType.class))).thenReturn(origem);
        when(em.find(eq(Beneficio.class), eq(2L), any(LockModeType.class))).thenReturn(destino);

        TransferenciaException ex = assertThrows(TransferenciaException.class,
                () -> service.transfer(1L, 2L, new BigDecimal("10")));
        assertEquals(TransferenciaException.Motivo.BENEFICIO_INATIVO, ex.getMotivo());
    }
}
