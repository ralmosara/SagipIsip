@echo off
echo ========================================================
echo   SAGIPISIP: Restoring Pre-Computed Vector Database
echo ========================================================
echo Restoring 18,047 vectors from sagipisip_vectors.sql...
echo.

docker exec -i sagipisip_postgres psql -U sagipisip -d sagipisip_db < "%~dp0sagipisip_vectors.sql"

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
