@echo off
setlocal
echo ========================================================
echo   SAGIPISIP: Restoring Pre-Computed Vector Database
echo ========================================================

set "SQL_FILE=%~dp0sagipisip_vectors.sql"
set "ZIP_FILE=%~dp0sagipisip_vectors.sql.zip"

if not exist "%SQL_FILE%" (
    if exist "%ZIP_FILE%" (
        echo Unpacking sagipisip_vectors.sql.zip...
        tar -xf "%ZIP_FILE%" -C "%~dp0" 2>nul || powershell -NoProfile -Command "Expand-Archive -Force -Path '%ZIP_FILE%' -DestinationPath '%~dp0'"
    ) else (
        echo ERROR: Neither sagipisip_vectors.sql nor sagipisip_vectors.sql.zip was found.
        pause
        exit /b 1
    )
)

if not exist "%SQL_FILE%" (
    echo ERROR: Failed to extract sagipisip_vectors.sql.
    pause
    exit /b 1
)

echo Restoring 18,047 vectors from sagipisip_vectors.sql...
echo.

docker exec -i sagipisip_postgres psql -U sagipisip -d sagipisip_db < "%SQL_FILE%"

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo   SUCCESS: Vector database restored in seconds!
    echo   Hindi mo na kailangan i-extract o i-embed ulit!
    echo ========================================================
) else (
    echo.
    echo ERROR: Failed to restore. Make sure Docker container sagipisip_postgres is running.
)

pause
