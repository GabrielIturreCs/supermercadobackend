@echo off
title IMPRESION AUTOMATICA - SUPERMERCADO
color 0A
echo.
echo ========================================================
echo   🖨️  SISTEMA DE IMPRESION AUTOMATICA ACTIVO  🖨️
echo ========================================================
echo.
echo ✅ Tu impresora local recibira tickets de Render automaticamente
echo ✅ Chrome monitoreara nuevos tickets cada 5 segundos
echo ✅ Impresion sin dialogos - Completamente automatica
echo.
echo 🔗 Endpoint: https://supermercadobackend.onrender.com/api/impresion/58mm-auto
echo 🖥️ Estado: MONITOREANDO...
echo.
echo ⚠️  MANTENER ESTA VENTANA ABIERTA ⚠️
echo    Presiona Ctrl+C para detener el servicio
echo.
echo ========================================================

:MONITOR_LOOP
echo [%TIME%] 🔍 Verificando nuevos tickets...

REM Generar ID unico para cada verificacion
set TICKET_ID=%RANDOM%

REM Abrir Chrome en modo kiosk para chequear e imprimir tickets
start /MIN "" "C:\Program Files\Google\Chrome\Application\chrome.exe" ^
--kiosk-printing ^
--kiosk ^
--no-default-browser-check ^
--disable-default-apps ^
--disable-popup-blocking ^
--autoplay-policy=no-user-gesture-required ^
"https://supermercadobackend.onrender.com/api/impresion/ticket/monitor_%TICKET_ID%"

echo [%TIME%] ✅ Verificacion enviada (ID: monitor_%TICKET_ID%)

REM Esperar 5 segundos antes del siguiente chequeo
timeout /t 5 /nobreak >nul

goto MONITOR_LOOP
