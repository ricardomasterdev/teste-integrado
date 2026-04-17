import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../services/loader.service';

/**
 * Overlay global de loading — inspirado no padrão orbital do projeto ZEEDI:
 * anel externo + anel interno reverso + core com logo central.
 * Adaptado para a identidade SGB (índigo + âmbar).
 */
@Component({
  selector: 'app-loader-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loader.loading()) {
      <div class="loader-overlay" role="status" aria-live="polite" aria-busy="true">
        <div class="sgb-spinner">
          <div class="ring ring-outer"></div>
          <div class="ring ring-inner"></div>
          <div class="core">
            <span class="core-label">SGB</span>
          </div>
        </div>
        <div class="loader-text">Processando</div>
      </div>
    }
  `,
  styles: [`
    :host { display: contents; }

    .loader-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      background: radial-gradient(circle at center, rgba(26,35,126,0.55), rgba(17,24,39,0.82));
      backdrop-filter: blur(4px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
      animation: overlay-in .25s ease;
    }

    .sgb-spinner {
      position: relative;
      width: 116px;
      height: 116px;
    }

    .ring {
      position: absolute;
      border-radius: 50%;
    }
    .ring-outer {
      inset: 0;
      border: 2.5px solid rgba(57, 73, 171, 0.15);
      border-top-color: #3949ab;
      border-right-color: rgba(57, 73, 171, 0.45);
      animation: spin-slow 1s linear infinite;
    }
    .ring-inner {
      inset: 10px;
      border: 1.8px solid rgba(255, 202, 40, 0.1);
      border-bottom-color: rgba(255, 202, 40, 0.75);
      border-left-color:   rgba(255, 202, 40, 0.35);
      animation: spin-reverse 1.5s linear infinite;
    }

    .core {
      position: absolute;
      inset: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3949ab 0%, #1a237e 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 20px rgba(57, 73, 171, 0.55),
                  inset 0 0 12px rgba(255,255,255,0.10);
      animation: core-pulse 1.6s ease-in-out infinite;

      .core-label {
        color: #ffca28;
        font-weight: 800;
        letter-spacing: 1.5px;
        font-size: 0.95rem;
        text-shadow: 0 0 8px rgba(255,202,40,0.5);
      }
    }

    .loader-text {
      color: #fff;
      font-size: 0.85rem;
      letter-spacing: 4px;
      text-transform: uppercase;
      font-weight: 500;
      opacity: 0.85;
      animation: blink 1.4s ease-in-out infinite;
    }

    @keyframes spin-slow    { from { transform: rotate(0deg);   } to { transform: rotate(360deg); } }
    @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg);   } }
    @keyframes core-pulse   { 0%,100% { transform: scale(1); } 50% { transform: scale(0.93); } }
    @keyframes blink        { 0%,100% { opacity: 0.55; } 50% { opacity: 1; } }
    @keyframes overlay-in   { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class LoaderOverlayComponent {
  loader = inject(LoaderService);
}
