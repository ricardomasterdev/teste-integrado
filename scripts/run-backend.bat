@echo off
REM ===================================================================
REM  Teste Integrado - Inicia o backend Spring Boot
REM  Porta: 8090  |  Profile: prod (PostgreSQL)
REM ===================================================================
setlocal ENABLEDELAYEDEXPANSION

set "ROOT=%~dp0.."
cd /d "%ROOT%\back\backend-module" || goto :err

REM --- Detectar Java 17 ---
if not defined JAVA_HOME (
    if exist "C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot" (
        set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.17.10-hotspot"
    ) else (
        for /d %%j in ("C:\Program Files\Eclipse Adoptium\jdk-17*") do set "JAVA_HOME=%%j"
    )
)
if not defined JAVA_HOME (
    echo [teste-integrado] ERRO: JDK 17 nao encontrado. Instale o Eclipse Temurin 17 e reexecute.
    exit /b 1
)
set "PATH=%JAVA_HOME%\bin;%PATH%"

REM --- Detectar Maven ---
where mvn >nul 2>&1
if errorlevel 1 (
    if exist "C:\ProgramData\chocolatey\lib\maven\apache-maven-3.9.14\bin\mvn.cmd" (
        set "PATH=C:\ProgramData\chocolatey\lib\maven\apache-maven-3.9.14\bin;%PATH%"
    ) else (
        echo [teste-integrado] ERRO: Maven nao encontrado no PATH.
        exit /b 1
    )
)

REM --- Variaveis de ambiente do app ---
if not defined SPRING_PROFILES_ACTIVE set "SPRING_PROFILES_ACTIVE=prod"
if not defined SERVER_PORT            set "SERVER_PORT=8090"
if not defined DB_HOST                set "DB_HOST=177.53.148.179"
if not defined DB_PORT                set "DB_PORT=5432"
if not defined DB_NAME                set "DB_NAME=teste_integrado"
if not defined DB_USER                set "DB_USER=codex"
if not defined DB_PASSWORD            set "DB_PASSWORD=Ric@7901"
if not defined APP_JWT_SECRET         set "APP_JWT_SECRET=change-me-to-a-strong-32byte-secret-key!!"
if not defined APP_JWT_EXPIRATION_MS  set "APP_JWT_EXPIRATION_MS=28800000"

echo [teste-integrado] Java     : %JAVA_HOME%
echo [teste-integrado] Profile  : %SPRING_PROFILES_ACTIVE%
echo [teste-integrado] Porta    : %SERVER_PORT%
echo [teste-integrado] Banco    : %DB_USER%@%DB_HOST%:%DB_PORT%/%DB_NAME%
echo.

REM --- Build se o JAR nao existe ---
if not exist "target\backend.jar" (
    echo [teste-integrado] Compilando backend (mvn package)...
    call mvn -B -DskipTests package || goto :err
)

echo [teste-integrado] Iniciando backend...
java -jar target\backend.jar --spring.profiles.active=%SPRING_PROFILES_ACTIVE%
goto :eof

:err
echo.
echo [teste-integrado] ERRO ao iniciar o backend.
exit /b 1
