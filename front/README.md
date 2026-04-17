# Frontend Angular 17

SPA do Desafio Fullstack Integrado.

## Stack
- Angular 17 (standalone components + signals)
- Angular Material 17
- RxJS, Reactive Forms
- TypeScript strict + strictTemplates

## Scripts

```bash
npm install
npm start                 # http://localhost:4200
npm run build:prod        # gera dist/ com base-href /teste-integrado/ pronto para publicação estática
npm test                  # Karma + Jasmine
```

## Estrutura

```
src/app/
├── core/
│   ├── guards/         authGuard, loginGuard
│   ├── interceptors/   authInterceptor (JWT + erro global)
│   ├── models/         tipagem do contrato da API
│   └── services/       AuthService, BeneficioService
└── features/
    ├── login/          tela de login
    ├── layout/         sidenav + toolbar
    ├── dashboard/      KPIs + rankings
    ├── beneficios/     CRUD + diálogos
    └── transferencias/ histórico/auditoria
```

## Configuração de ambientes

- `src/environments/environment.ts` — dev (aponta para `http://localhost:8090/teste-integrado/api`)
- `src/environments/environment.prod.ts` — produção (aponta para `/teste-integrado/api`, mesma origem via reverse proxy)

O build de produção troca o arquivo via `fileReplacements` no `angular.json`.
