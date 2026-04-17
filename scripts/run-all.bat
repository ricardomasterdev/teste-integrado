@echo off
REM ===================================================================
REM  Teste Integrado - Sobe backend + frontend em terminais separados
REM ===================================================================
setlocal

set "ROOT=%~dp0.."

echo [teste-integrado] Iniciando backend em nova janela...
start "teste-integrado :: backend" cmd /k "call %~dp0run-backend.bat"

echo [teste-integrado] Aguardando backend subir (15s)...
timeout /t 15 /nobreak >nul

echo [teste-integrado] Iniciando frontend em nova janela...
start "teste-integrado :: frontend" cmd /k "call %~dp0run-frontend.bat"

echo.
echo [teste-integrado] Servicos iniciados:
echo   Backend : http://localhost:8090/teste-integrado/api  (Swagger: /swagger-ui.html)
echo   Frontend: http://localhost:4200
echo.
