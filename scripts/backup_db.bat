@echo off
echo ===========================================
echo       BACKUP DATABASE JADWAL PENDADARAN
echo ===========================================

:: Set Password database Anda di bawah ini (jika ingin otomatis tanpa ketik password)
:: set PGPASSWORD=password_anda

:: Sesuaikan path pg_dump jika belum ada di environment variable
set PG_DUMP="pg_dump"
:: Contoh jika path spesifik:
:: set PG_DUMP="C:\Program Files\PostgreSQL\16\bin\pg_dump.exe"

:: Generate nama file dengan timestamp
set FILENAME=backup_jadwal_%date:~10,4%-%date:~7,2%-%date:~4,2%_%time:~0,2%%time:~3,2%.sql
set FILENAME=%FILENAME: =0%

echo Sedang membackup database 'jadwal_pendadaran' ke file: %FILENAME%...
echo.

%PG_DUMP% -U postgres -h localhost -d jadwal_pendadaran -f "%FILENAME%"

if %ERRORLEVEL% equ 0 (
    echo.
    echo ✅ Backup BERHASIL! file tersimpan.
) else (
    echo.
    echo ❌ Backup GAGAL! Pastikan PostgreSQL berjalan dan path pg_dump benar.
    echo    Jika error 'password authentication failed', pastikan password benar.
)

echo.
pause
