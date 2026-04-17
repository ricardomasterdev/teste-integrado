# 🐞 Análise detalhada do bug de transferência

## Código original (ejb-module entregue pelo desafio)

```java
@Stateless
public class BeneficioEjbService {
    @PersistenceContext
    private EntityManager em;

    public void transfer(Long fromId, Long toId, BigDecimal amount) {
        Beneficio from = em.find(Beneficio.class, fromId);
        Beneficio to   = em.find(Beneficio.class, toId);
        from.setValor(from.getValor().subtract(amount));
        to.setValor(to.getValor().add(amount));
        em.merge(from);
        em.merge(to);
    }
}
```

## 1. Lost Update (condição de corrida)

Duas transações concorrentes fazem `em.find` sem lock:

```
T1: saldo = 1000  → subtrai 600 → saldo=400
T2: saldo = 1000  → subtrai 700 → saldo=300
commit T1   → banco grava 400
commit T2   → banco grava 300   ❌ perdemos a operação de T1
```

### Correção aplicada
`LockModeType.PESSIMISTIC_WRITE` no `em.find` → o Hibernate emite `SELECT ... FOR UPDATE`, bloqueando a linha até o commit. A segunda transação aguarda e lê o saldo **pós-commit** de T1.

## 2. Saldo negativo

Sem nenhuma checagem, `from.getValor().subtract(amount)` pode produzir valores negativos. Em um sistema financeiro isso é crítico.

### Correção aplicada
```java
if (from.getValor().compareTo(amount) < 0) {
    throw new TransferenciaException(SALDO_INSUFICIENTE, ...);
}
```

A exceção está anotada com `@ApplicationException(rollback = true)`, garantindo que o container EJB reverta qualquer alteração pendente.

## 3. Deadlock quando transferências opostas ocorrem simultaneamente

```
T1: transfer(A, B, 100)  → lock A, então lock B
T2: transfer(B, A, 50)   → lock B, então lock A
           ↑ deadlock: cada um espera o lock do outro
```

### Correção aplicada
Aquisição de lock sempre em ordem ascendente de ID:

```java
Long firstId  = fromId < toId ? fromId : toId;
Long secondId = fromId < toId ? toId   : fromId;

Beneficio first  = lockAndLoad(firstId);
Beneficio second = lockAndLoad(secondId);
```

Com isso, T1 e T2 pedem os locks na mesma ordem — sempre `A` antes de `B`. Deadlock torna-se impossível.

## 4. Validações de entrada ausentes

O código original aceita:
- `fromId = null` → `NullPointerException` não tratada
- `fromId == toId` → "transfere pra si mesmo"
- `amount = 0` ou `amount = -5` → operações sem sentido

### Correção aplicada
`validarParametros` rejeita esses casos com `Motivo.VALOR_INVALIDO` ou `Motivo.MESMA_CONTA`.

## 5. Rollback não garantido

Sem anotação transacional explícita, o comportamento depende do descritor do deployment. Se uma exceção for lançada no meio, o estado pode ficar inconsistente.

### Correção aplicada
- `@TransactionAttribute(TransactionAttributeType.REQUIRED)` — a operação inteira roda em uma transação.
- `@ApplicationException(rollback = true)` em `TransferenciaException` — qualquer falha de negócio dispara rollback.
- `em.flush()` após `merge()` — força a emissão imediata dos `UPDATE`s, permitindo detectar conflitos **dentro** do bloco `try/catch` e converter `OptimisticLockException`/`PessimisticLockException` em mensagem amigável.

## 6. Benefício inativo

Um benefício desativado ainda aceitaria transferência, o que viola a regra de negócio.

### Correção aplicada
```java
if (Boolean.FALSE.equals(from.getAtivo()) || Boolean.FALSE.equals(to.getAtivo()))
    throw new TransferenciaException(BENEFICIO_INATIVO, ...);
```

## Equivalência no Spring Boot

A mesma lógica está em [`back/backend-module/.../service/BeneficioService.java`](../back/backend-module/src/main/java/com/example/backend/service/BeneficioService.java), com o repositório Spring Data oferecendo o lock pessimista via `@Lock(PESSIMISTIC_WRITE)` em `findByIdForUpdate`. Adicionalmente, cada tentativa é auditada em `beneficio_transferencia` com transação em `REQUIRES_NEW` para sobreviver ao rollback do negócio.
