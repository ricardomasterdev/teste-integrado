import { Injectable, signal, computed } from '@angular/core';

/**
 * Contador de chamadas HTTP pendentes.
 * O loader overlay é exibido enquanto houver pelo menos 1 chamada ativa.
 */
@Injectable({ providedIn: 'root' })
export class LoaderService {

  private readonly count = signal(0);
  readonly loading = computed(() => this.count() > 0);

  /** Duração mínima do loader (ms) — default 1 s para dar feedback visual consistente
   *  em toda operação do sistema, mesmo quando a resposta é instantânea. */
  private readonly MIN_MS = 1000;
  private firstShownAt = 0;

  inc(): void {
    if (this.count() === 0) this.firstShownAt = Date.now();
    this.count.update(c => c + 1);
  }

  dec(): void {
    const remaining = Math.max(0, this.MIN_MS - (Date.now() - this.firstShownAt));
    setTimeout(() => this.count.update(c => Math.max(0, c - 1)), remaining);
  }

  /** Mostra forçadamente por N ms — útil em transições de rota. */
  pulse(ms = 1200): void {
    this.inc();
    setTimeout(() => this.dec(), ms);
  }
}
