@echo off
REM ===================================================================
REM  Teste Integrado - Inicia o frontend Angular em modo dev
REM  Porta padrao: 4200
REM ===================================================================
setlocal ENABLEDELAYEDEXPANSION

set "ROOT=%~dp0.."
cd /d "%ROOT%\front" || goto :err

echo [teste-integrado] Iniciando frontend em http://localhost:4200
echo [teste-integrado] API apontada para: http://localhost:8090/teste-integrado/api
echo.

if not exist "node_modules" (
    echo [teste-integrado] node_modules nao encontrado. Executando npm install...
    call npm install --no-audit --no-fund || goto :err
)

call npx ng serve --host 0.0.0.0 --port 4200 --open
goto :eof

:err
echo.
echo [teste-integrado] ERRO ao iniciar o frontend.
exit /b 1
