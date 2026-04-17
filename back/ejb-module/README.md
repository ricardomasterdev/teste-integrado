# EJB Module – Correção do Bug de Transferência

Este módulo entrega o artefato **Jakarta EE (EJB 4 / Jakarta EE 10)** corrigido
conforme exigido pelo desafio. A **mesma lógica** foi re-implementada no
`backend-module` (Spring Boot) para simplificar o deploy.

## Bug original

```java
public void transfer(Long fromId, Long toId, BigDecimal amount) {
    Beneficio from = em.find(Beneficio.class, fromId);
    Beneficio to   = em.find(Beneficio.class, toId);
    // sem validações, sem locking, pode gerar saldo negativo e lost update
    from.setValor(from.getValor().subtract(amount));
    to.setValor(to.getValor().add(amount));
    em.merge(from);
    em.merge(to);
}
```

### Problemas identificados

| # | Problema | Impacto |
|---|----------|---------|
| 1 | Nenhuma validação de parâmetros (`null`, mesmo ID, valor ≤ 0) | `NullPointerException`, transferências absurdas |
| 2 | Nenhuma checagem de saldo | Saldo negativo em produção |
| 3 | `em.find` sem `LockModeType` | **Lost update** (duas transações lendo o mesmo valor) |
| 4 | Sem tratamento de falha → sem rollback garantido | Débito na origem sem crédito no destino |
| 5 | Sem verificação de benefício ativo | Transferência em conta inválida |
| 6 | Ordem de lock aleatória | Risco de **deadlock** quando A→B e B→A ocorrem simultaneamente |

## Correção aplicada

`BeneficioEjbService.java`:

- `@TransactionAttribute(REQUIRED)` — toda a operação em uma única transação.
- `LockModeType.PESSIMISTIC_WRITE` — `SELECT ... FOR UPDATE` em ambas as linhas.
- **Ordem ascendente de ID** ao travar — previne deadlock determinístico.
- `@Version` (optimistic) na entidade — defesa em profundidade.
- `TransferenciaException` marcada com `@ApplicationException(rollback = true)` — rollback automático.
- Validações de negócio centralizadas (`validarParametros`, `validarEstado`).
- Captura explícita de `OptimisticLockException`/`PessimisticLockException`.

## Testes

`src/test/java/com/example/ejb/BeneficioEjbServiceTest.java` cobre:

- Sucesso de transferência (débito/crédito).
- Saldo insuficiente.
- Valor zero / negativo.
- Mesma conta origem/destino.
- Benefício inexistente.
- Benefício inativo.

Rodar: `mvn -f ejb-module test`
