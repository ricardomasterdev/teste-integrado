@echo off
REM ===================================================================
REM  Teste Integrado - Build de producao (backend JAR + frontend dist)
REM ===================================================================
setlocal ENABLEDELAYEDEXPANSION

set "ROOT=%~dp0.."

REM --- Java/Maven ---
if not defined JAVA_HOME (
    for /d %%j in ("C:\Program Files\Eclipse Adoptium\jdk-17*") do set "JAVA_HOME=%%j"
)
set "PATH=%JAVA_HOME%\bin;C:\ProgramData\chocolatey\lib\maven\apache-maven-3.9.14\bin;%PATH%"

echo [teste-integrado] ===== Build Backend =====
cd /d "%ROOT%\back\backend-module" || goto :err
call mvn -B clean package || goto :err
echo [teste-integrado] JAR gerado: %CD%\target\backend.jar

echo.
echo [teste-integrado] ===== Build Frontend =====
cd /d "%ROOT%\front" || goto :err
if not exist "node_modules" call npm install --no-audit --no-fund || goto :err
call npm run build:prod || goto :err
echo [teste-integrado] dist/ gerado em: %CD%\dist

echo.
echo [teste-integrado] Build concluido com sucesso.
goto :eof

:err
echo.
echo [teste-integrado] ERRO no build.
exit /b 1
